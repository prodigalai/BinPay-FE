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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">Player Base</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Manage and monitor registered players</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
             <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Total Players</span>
             <span className="text-xl font-black text-white">{players.length}</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 section-glass p-1.5 rounded-2xl w-full sm:w-fit">
        <GlassInput 
          placeholder="Search by name, email or username..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full sm:w-64 h-10 text-xs"
          icon={<Search className="w-4 h-4" />}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-xl border border-white/10 bg-black/40 text-xs font-medium focus:outline-none focus:border-primary/50 transition-all uppercase tracking-wide cursor-pointer hover:bg-white/5"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Player Identity</th>
                <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Contact</th>
                <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">Status</th>
                <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5 text-right">Lifetime Volume</th>
                <th className="py-5 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Player Data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-xs font-medium italic text-muted-foreground">No players match your search criteria.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id ?? p._id ?? p.email} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-white/5 shadow-inner">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{p.fullName ?? p.name ?? "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">@{p.username || "user"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-muted-foreground font-medium">{p.email}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={statusConfig[p.status ?? ""] ?? "pending"}>{p.status ?? "pending"}</StatusBadge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        <span className="font-black text-xs text-emerald-500 tabular-nums">{(p.totalDeposits ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-muted-foreground font-medium whitespace-nowrap">
                      {p.createdAt ?? (p.createdAtDate ? new Date(p.createdAtDate).toLocaleDateString() : "—")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
