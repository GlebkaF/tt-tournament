import type { Metadata } from "next";
import AdminPlayers from "@/component/AdminPlayers";

export const metadata: Metadata = {
  title: "Управление игроками — Теннис. Евроберег",
};

export default function AdminPlayersPage() {
  return (
    <div className="poster-scope min-h-screen bg-poster-paper text-poster-ink">
      <AdminPlayers />
    </div>
  );
}
