import { readFileSync } from 'fs';
import { join } from 'path';

export function loadWorkData(id: string) {
  if (typeof window !== 'undefined') {
    return null;
  }

  const useJson = process.env.NEXT_PUBLIC_USE_JSON === 'true';

  if (!useJson) {
    return null;
  }

  try {
    const filePath = join(process.cwd(), 'content', 'pages', 'works', `${id}.json`);
    const fileContent = readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    const content = jsonData.content || [];
    const result: any = {};

    content.forEach((item: any) => {
      if (item.type === 'HeroHeadline') {
        result.title = item.props.title;
        result.idNum = item.props.eyebrow?.replace('Project ', '') || '';
      }
      if (item.type === 'RichParagraph') {
        result.description = item.props.content;
      }
      if (item.type === 'MediaTextCard') {
        const id = item.props.id;
        if (id === 'col1-1') result.col1 = { title: item.props.title, text: item.props.description, img: item.props.imageSrc };
        if (id === 'col2-1') result.col2 = { title: item.props.title, text: item.props.description, img: item.props.imageSrc };
        if (id === 'col3-1') result.col3 = { title: item.props.title, text: item.props.description, img: item.props.imageSrc };
      }
      if (item.type === 'NextProjectBlock') {
        result.nextId = item.props.nextId;
        result.nextName = item.props.nextName;
        result.nextBg = item.props.nextBg;
      }
    });

    return result;
  } catch {
    return null;
  }
}
