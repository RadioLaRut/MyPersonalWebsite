import type { ReactNode } from "react";

interface ContactDirectionItemProps {
  title: ReactNode;
  subtitle: ReactNode;
}

export default function ContactDirectionItem({ title, subtitle }: ContactDirectionItemProps) {
  return (
    <div className="flex flex-col">
      <span>{title}</span>
      <span className="mt-1 text-sm font-mono opacity-50">{subtitle}</span>
    </div>
  );
}
