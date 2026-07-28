import DeferredPublicRuntime from "@/components/layout/DeferredPublicRuntime";
import Navigation from "@/components/layout/Navigation";
import { SiteOpening } from "@/components/layout/SiteOpening";
import {
  COMPONENT_DESIGN_COMMIT_CHANNEL,
  COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE,
} from "@/lib/component-design-commit";
import { isTestingMode } from "@/lib/site-mode";
import "../fonts/generated/public-fonts.css";

const PUBLIC_SITE_ROOT_ID = "public-site-root";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const testingMode = isTestingMode();
  const componentDesignRefreshScript = `(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(${JSON.stringify(COMPONENT_DESIGN_COMMIT_CHANNEL)});
    channel.addEventListener("message", (event) => {
      const value = event.data;
      if (
        value &&
        value.type === ${JSON.stringify(COMPONENT_DESIGN_COMMIT_MESSAGE_TYPE)} &&
        value.version === 1
      ) {
        window.location.reload();
      }
    });
    window.addEventListener("pagehide", () => channel.close(), { once: true });
  })();`;

  return (
    <>
      {testingMode ? (
        <>
          <script dangerouslySetInnerHTML={{ __html: componentDesignRefreshScript }} />
          <div className="site-grid-debug" aria-hidden="true">
            <div className="site-grid-debug__grid grid-container">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={`site-grid-debug-${index + 1}`} className="site-grid-debug__column" />
              ))}
            </div>
          </div>
        </>
      ) : null}
      <noscript>
        <style>{`
          [data-site-opening-overlay] { display: none !important; }
          [data-site-opening-state="loading"] [data-hero-lead],
          [data-site-opening-state="loading"] [data-hero-supporting],
          [data-site-opening-state="complete"] [data-hero-lead],
          [data-site-opening-state="complete"] [data-hero-supporting] {
            animation-play-state: running !important;
          }
        `}</style>
      </noscript>
      <div
        id={PUBLIC_SITE_ROOT_ID}
        className="public-font-scope"
        data-font-scope="public"
        data-site-opening-state="loading"
      >
        <SiteOpening rootId={PUBLIC_SITE_ROOT_ID} />
        <DeferredPublicRuntime />
        <Navigation testingMode={testingMode} />
        {children}
      </div>
    </>
  );
}
