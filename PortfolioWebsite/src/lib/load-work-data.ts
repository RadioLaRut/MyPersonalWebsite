import { readFileSync } from 'fs';
import { join } from 'path';
import { usesJsonContent } from '@/lib/site-mode';

type WorkBlockProps = Record<string, unknown>;
type WorkContentItem = {
  type?: string;
  props?: WorkBlockProps;
};

type WorkJsonFile = {
  content?: WorkContentItem[];
};

type WorkColumn = {
  title?: string;
  text?: string;
  img?: string;
};

export type LoadedWorkData = {
  title?: string;
  idNum?: string;
  heroImage?: string;
  description?: string;
  col1?: WorkColumn;
  col2?: WorkColumn;
  col3?: WorkColumn;
  gallery?: string[];
  navLink?: string;
  nextId?: string;
  nextName?: string;
  nextBg?: string;
};

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function buildColumn(props: WorkBlockProps, key: 'col1' | 'col2' | 'col3'): WorkColumn {
  const prefix = key === 'col1' ? 'col1' : key === 'col2' ? 'col2' : 'col3';
  return {
    title: asString(props[`${prefix}Title`]),
    text: asString(props[`${prefix}Text`]),
    img: asString(props[`${prefix}Img`]),
  };
}

export function loadWorkData(id: string) {
  if (typeof window !== 'undefined') {
    return null;
  }

  const useJson = usesJsonContent();

  if (!useJson) {
    return null;
  }

  try {
    const filePath = join(process.cwd(), 'content', 'pages', 'works', `${id}.json`);
    const fileContent = readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent) as WorkJsonFile;

    const content = Array.isArray(jsonData.content) ? jsonData.content : [];
    const result: LoadedWorkData = {};

    content.forEach((item) => {
      const props = item.props ?? {};
      if (item.type === 'HeroHeadline') {
        result.title = asString(props.title);
        result.idNum = asString(props.eyebrow)?.replace('Project ', '') || '';
        result.heroImage = asString(props.heroImage);
        result.navLink = asString(props.navLink);
      }
      if (item.type === 'RichParagraph') {
        result.description = asString(props.content);
      }
      if (item.type === 'MediaTextCard') {
        const mediaCardId = asString(props.id);
        const mediaCardColumn: WorkColumn = {
          title: asString(props.title),
          text: asString(props.description),
          img: asString(props.imageSrc),
        };

        if (mediaCardId === 'col1-1') result.col1 = mediaCardColumn;
        if (mediaCardId === 'col2-1') result.col2 = mediaCardColumn;
        if (mediaCardId === 'col3-1') result.col3 = mediaCardColumn;
      }
      if (item.type === 'BreakdownTriptych') {
        result.col1 = buildColumn(props, 'col1');
        result.col2 = buildColumn(props, 'col2');
        result.col3 = buildColumn(props, 'col3');
      }
      if (item.type === 'MosaicGallery') {
        const images = props.images;
        if (Array.isArray(images)) {
          result.gallery = images
            .map((imageItem) => {
              if (!imageItem || typeof imageItem !== 'object') {
                return undefined;
              }
              return asString((imageItem as WorkBlockProps).src);
            })
            .filter((src): src is string => Boolean(src));
        }
      }
      if (item.type === 'NextProjectBlock') {
        result.nextId = asString(props.nextId);
        result.nextName = asString(props.nextName);
        result.nextBg = asString(props.nextBg);
      }
    });

    if (Object.keys(result).length === 0) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}
