import { Data } from "@measured/puck";

export function ensurePuckDataIds(data: Data): Data {
  if (!data?.content) return data;
  const fixedContent = data.content.map(item => {
    if (!item.props) item.props = {};
    if (!item.props.id) {
      item.props.id = `${item.type}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return item;
  });
  return { ...data, content: fixedContent };
}
