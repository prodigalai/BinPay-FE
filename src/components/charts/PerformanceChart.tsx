import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
      <div className="h-full w-full flex items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-3">
           <div className="relative w-10 h-10">
             <div className="absolute inset-0 border-2 border-[#1e2330] rounded-full" />
             <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500/60 rounded-full animate-spin" />
           </div>
           <p className="text-[12px] font-medium text-[#4a5568]">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="text-[16px] font-semibold text-white mb-1">Financial Overview</h3>
          <p className="text-[12px] text-[#4f5d73]">
            {range === '1y' ? 'Monthly' : 'Daily'} performance · {range === '7d' ? 'Last 7 days' : (range === '1y' ? 'Past 12 months' : 'Last 30 days')}
          </p>
        </div>
        
        <div className="flex items-center gap-5">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-[3px] rounded-full bg-emerald-400" />
              <span className="text-[12px] text-[#5a6680]">Deposits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-[3px] rounded-full bg-orange-400" />
              <span className="text-[12px] text-[#5a6680]">Withdrawals</span>
            </div>
          </div>

          {/* Range Selector */}
          <div className="flex p-1 bg-[#12151a] rounded-xl border border-[#1e2330]">
            {(['7d', '30d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200",
                  range === r 
                    ? "bg-[#1e2330] text-white shadow-sm" 
                    : "text-[#4a5568] hover:text-[#8a95a8]"
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="depositFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.15} />
                <stop offset="60%" stopColor="#34d399" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="withdrawalFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity={0.1} />
                <stop offset="60%" stopColor="#fb923c" stopOpacity={0.03} />
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#1a1f2e" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#2a3242"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={12}
              fontFamily="Inter, sans-serif"
              fontWeight={500}
              tick={{ fill: '#4a5568' }}
            />
            <YAxis 
              stroke="#2a3242"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
              dx={-4}
              fontFamily="Inter, sans-serif"
              fontWeight={500}
              tick={{ fill: '#4a5568' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                border: "1px solid #2a3242",
                borderRadius: "12px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
                padding: "14px 18px"
              }}
              itemStyle={{ fontSize: "12px", fontWeight: 500, color: "#8a95a8" }}
              labelStyle={{ color: "#fff", marginBottom: "8px", fontSize: "12px", fontWeight: 600 }}
              cursor={{ stroke: '#2a3242', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="deposits"
              stroke="#34d399"
              strokeWidth={2.5}
              fill="url(#depositFill)"
              dot={false}
              activeDot={{ r: 5, fill: "#12151a", strokeWidth: 2.5, stroke: "#34d399" }}
            />
            <Area
              type="monotone"
              dataKey="withdrawals"
              stroke="#fb923c"
              strokeWidth={2}
              fill="url(#withdrawalFill)"
              dot={false}
              activeDot={{ r: 5, fill: "#12151a", strokeWidth: 2.5, stroke: "#fb923c" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
