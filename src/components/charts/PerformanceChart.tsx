import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", deposits: 45000, withdrawals: 32000 },
  { month: "Feb", deposits: 52000, withdrawals: 28000 },
  { month: "Mar", deposits: 48000, withdrawals: 35000 },
  { month: "Apr", deposits: 61000, withdrawals: 42000 },
  { month: "May", deposits: 55000, withdrawals: 38000 },
  { month: "Jun", deposits: 67000, withdrawals: 45000 },
  { month: "Jul", deposits: 72000, withdrawals: 48000 },
  { month: "Aug", deposits: 68000, withdrawals: 52000 },
  { month: "Sep", deposits: 75000, withdrawals: 55000 },
  { month: "Oct", deposits: 82000, withdrawals: 58000 },
  { month: "Nov", deposits: 78000, withdrawals: 62000 },
  { month: "Dec", deposits: 95000, withdrawals: 68000 },
];

export function PerformanceChart() {
  return (
    <div className="h-full w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 px-2">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Financial Performance</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Monthly deposits vs withdrawals</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-xs text-muted-foreground font-medium">Deposits</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-black border border-white/20 shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
            <span className="text-xs text-muted-foreground font-medium">Withdrawals</span>
          </div>
        </div>
      </div>
      <div className="h-[250px] sm:h-[320px] chart-grid rounded-lg p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                padding: "12px"
              }}
              itemStyle={{ fontSize: "12px", fontWeight: 500 }}
              labelStyle={{ color: "#e5e7eb", marginBottom: "8px", fontSize: "12px" }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="deposits"
              stroke="#22c55e"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#22c55e", strokeWidth: 4, stroke: "rgba(34,197,94,0.3)" }}
            />
            <Line
              type="monotone"
              dataKey="withdrawals"
              stroke="#000000"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#000000", strokeWidth: 4, stroke: "rgba(255,255,255,0.3)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
