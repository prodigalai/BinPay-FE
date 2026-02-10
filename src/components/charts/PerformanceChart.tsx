import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "../../lib/utils";

interface ChartData {
  month: string;
  deposits: number;
  withdrawals: number;
}

interface PerformanceChartProps {
  data: ChartData[];
  isLoading?: boolean;
  range: string;
  onRangeChange: (range: string) => void;
}

export function PerformanceChart({ data, isLoading, range, onRangeChange }: PerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-8 px-2">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-black tracking-tight uppercase italic text-white/90">Financial Performance</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            {range === '1y' ? 'Monthly' : 'Daily'} deposits vs withdrawals (Last {range === '7d' ? '7 Days' : (range === '1y' ? 'Year' : '30 Days')})
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          {/* Legend */}
          <div className="flex items-center gap-4 mr-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Deposits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Withdrawals</span>
            </div>
          </div>

          {/* Filter Toggles */}
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 h-9">
            {(['7d', '30d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={cn(
                  "px-4 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  range === r ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[250px] sm:h-[300px] chart-grid rounded-lg p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
              fontFamily="Inter, sans-serif"
              fontWeight={700}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
              dx={-10}
              fontFamily="Inter, sans-serif"
              fontWeight={700}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                padding: "16px"
              }}
              itemStyle={{ fontSize: "11px", fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              labelStyle={{ color: "#e5e7eb", marginBottom: "8px", fontSize: "11px", fontWeight: 900, textTransform: 'uppercase' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="deposits"
              stroke="#10b981"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: "#10b981", strokeWidth: 4, stroke: "rgba(16,185,129,0.2)" }}
            />
            <Line
              type="monotone"
              dataKey="withdrawals"
              stroke="#ef4444"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: "#ef4444", strokeWidth: 4, stroke: "rgba(239,68,68,0.2)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
