import { redirect } from "next/navigation";

interface Props {
  params: { platform: string; handle: string };
}

export default function ScorePage({ params }: Props) {
  redirect("/claim");
}
