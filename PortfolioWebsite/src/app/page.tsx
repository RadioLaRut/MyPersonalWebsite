import { redirect } from "next/navigation";
import { isCmsPreviewEnabled } from "@/lib/site-mode";

export default function Home() {
  if (isCmsPreviewEnabled()) {
    redirect("/p");
  }

  redirect("/p");
}
