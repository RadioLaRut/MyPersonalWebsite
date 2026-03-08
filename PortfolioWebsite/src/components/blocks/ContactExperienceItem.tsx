import type { ReactNode } from "react";

interface ContactExperienceItemProps {
  company: ReactNode;
  role: ReactNode;
}

export default function ContactExperienceItem({ company, role }: ContactExperienceItemProps) {
  return (
    <div className="flex flex-col">
      <span>{company}</span>
      <span className="mt-1 text-sm font-mono opacity-50">{role}</span>
    </div>
  );
}
