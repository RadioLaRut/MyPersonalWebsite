import { redirect } from "next/navigation";

export default function Home() {
  if (process.env.NEXT_PUBLIC_ENABLE_PUCK === "true") {
    redirect("/p");
  }

  redirect("/p");
}
