import { notFound } from "next/navigation";

import SampleBreakdownClient from "@/components/playground/SampleBreakdownClient";
import { isTestingMode } from "@/lib/site-mode";

export default function SampleBreakdownPage() {
  if (!isTestingMode()) {
    notFound();
  }

  return <SampleBreakdownClient />;
}
