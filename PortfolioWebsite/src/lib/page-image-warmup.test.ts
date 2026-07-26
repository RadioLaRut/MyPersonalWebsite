import assert from "node:assert/strict";
import test from "node:test";

import {
  prioritizePageImage,
  selectCriticalPageImage,
  waitForPageImage,
  warmPageImages,
} from "./page-image-warmup.ts";

class FakeImage extends EventTarget {
  complete = false;
  crossOrigin: string | null = null;
  currentSrc = "";
  decoding: "async" | "auto" | "sync" = "auto";
  fetchPriority: "auto" | "high" | "low" = "auto";
  loading: "eager" | "lazy" = "lazy";
  naturalWidth = 0;
  referrerPolicy = "";
  sizes = "100vw";
  src = "";
  srcset = "";
  private readonly rect: {
    bottom: number;
    height: number;
    top: number;
    width: number;
  };

  constructor(
    rect = {
      bottom: 900,
      height: 900,
      top: 0,
      width: 1600,
    },
  ) {
    super();
    this.rect = rect;
  }

  decode() {
    return Promise.resolve();
  }

  getBoundingClientRect() {
    return {
      ...this.rect,
      left: 0,
      right: this.rect.width,
      x: 0,
      y: this.rect.top,
      toJSON() {
        return {};
      },
    };
  }

  succeed() {
    this.complete = true;
    this.naturalWidth = 1600;
    this.dispatchEvent(new Event("load"));
  }

  fail() {
    this.complete = true;
    this.naturalWidth = 0;
    this.dispatchEvent(new Event("error"));
  }
}

function asHtmlImage(image: FakeImage) {
  return image as unknown as HTMLImageElement;
}

test("首屏图片优先选择显式高优先级资源，其次选择可见图片", () => {
  const visible = new FakeImage();
  visible.src = "/visible.webp";
  const prioritized = new FakeImage({
    bottom: 2200,
    height: 900,
    top: 1300,
    width: 1600,
  });
  prioritized.src = "/priority.webp";
  prioritized.fetchPriority = "high";

  assert.equal(
    selectCriticalPageImage(
      [asHtmlImage(visible), asHtmlImage(prioritized)],
      900,
    ),
    asHtmlImage(prioritized),
  );

  prioritized.fetchPriority = "auto";
  assert.equal(
    selectCriticalPageImage(
      [asHtmlImage(visible), asHtmlImage(prioritized)],
      900,
    ),
    asHtmlImage(visible),
  );
});

test("图片等待逻辑覆盖成功、失败、超时与取消", async () => {
  const loaded = new FakeImage();
  loaded.src = "/loaded.webp";
  const loadedPromise = waitForPageImage(asHtmlImage(loaded), {
    timeoutMs: 100,
  });
  loaded.succeed();
  assert.equal(await loadedPromise, "loaded");

  const failed = new FakeImage();
  failed.src = "/failed.webp";
  const failedPromise = waitForPageImage(asHtmlImage(failed), {
    timeoutMs: 100,
  });
  failed.fail();
  assert.equal(await failedPromise, "error");

  const timedOut = new FakeImage();
  timedOut.src = "/timeout.webp";
  assert.equal(
    await waitForPageImage(asHtmlImage(timedOut), { timeoutMs: 1 }),
    "timeout",
  );

  const controller = new AbortController();
  const aborted = new FakeImage();
  aborted.src = "/aborted.webp";
  const abortedPromise = waitForPageImage(asHtmlImage(aborted), {
    signal: controller.signal,
    timeoutMs: 100,
  });
  controller.abort();
  assert.equal(await abortedPromise, "aborted");
});

test("后台预热限制并发、去重资源并继续处理失败图片", async () => {
  const first = new FakeImage();
  first.src = "/one.webp";
  const duplicate = new FakeImage();
  duplicate.src = "/one.webp";
  const failed = new FakeImage();
  failed.src = "/failed.webp";

  const warmupPromise = warmPageImages(
    [asHtmlImage(first), asHtmlImage(duplicate), asHtmlImage(failed)],
    {
      concurrency: 2,
      timeoutMs: 100,
    },
  );

  assert.equal(first.loading, "eager");
  assert.equal(first.fetchPriority, "low");
  assert.equal(failed.loading, "eager");
  assert.equal(duplicate.loading, "lazy");

  first.succeed();
  failed.fail();

  assert.deepEqual(await warmupPromise, {
    aborted: 0,
    errors: 1,
    loaded: 1,
    timedOut: 0,
    total: 2,
  });
});

test("首图提权不会依赖图片原始格式", () => {
  const image = new FakeImage();
  image.src = "/placeholder.png";

  prioritizePageImage(asHtmlImage(image), "high");

  assert.equal(image.loading, "eager");
  assert.equal(image.fetchPriority, "high");
});
