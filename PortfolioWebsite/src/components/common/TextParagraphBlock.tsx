import BilingualText from "@/components/common/BilingualText";

interface TextParagraphBlockProps {
  text: string;
}

export default function TextParagraphBlock({ text }: TextParagraphBlockProps) {
  return (
    <p className="break-words">
      <BilingualText text={text} weight="medium" />
    </p>
  );
}
