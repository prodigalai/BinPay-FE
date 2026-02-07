import { useState, useEffect } from "react";
import { Users, Search, DollarSign } from "lucide-react";
import { api } from "../lib/api";
import type { Player, PlayersResponse } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { StatusBadge } from "../components/ui/status-badge";
import { GlassInput } from "../components/ui/glass-input";

const statusConfig: Record<string, "pending" | "verified" | "blocked"> = {
  pending: "pending",
  verified: "verified",
  blocked: "blocked",
};

export default function Players() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const params: Record<string, string> = { page: "1", limit: "50" };
    if (searchQuery) params.search = searchQuery;
    if (statusFilter !== "all") params.status = statusFilter;
    setLoading(true);
    api.get<PlayersResponse>("players", { params })
      .then((res) => {
        if (res.success) setPlayers(res.players ?? []);
      })
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, [searchQuery, statusFilter]);

  const filtered = players.filter((p) => {
    const q = searchQuery.toLowerCase();
    const name = (p.fullName ?? p.name ?? "").toLowerCase();
    const email = (p.email ?? "").toLowerCase();
    const username = (p.username ?? "").toLowerCase();
    return !q || name.includes(q) || email.includes(q) || username.includes(q);
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold">Players</h1>

      <div className="flex flex-wrap gap-3">
        <GlassInput placeholder="Search by name or email…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-xs" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-white/10 bg-card/60 text-sm"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="glass rounded-lg overflow-hidden">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Player</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Email</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Total deposits</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No players found.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id ?? p._id ?? p.email} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{p.fullName ?? p.name ?? p.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{p.email}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={statusConfig[p.status ?? ""] ?? "pending"}>{p.status ?? "pending"}</StatusBadge>
                  </td>
                  <td className="py-3 px-4 font-semibold text-primary">
                    ${(p.totalDeposits ?? 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {p.createdAt ?? (p.createdAtDate ? new Date(p.createdAtDate).toLocaleDateString() : "—")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
