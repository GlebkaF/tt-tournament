import { redirect } from "next/navigation";

export default function LegacyRatingPage() {
  redirect("/rating?rating=1");
}
