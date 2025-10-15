import { redirect } from "next/navigation";

export default function Home() {
  redirect("/generate/new");

  return null;
}
