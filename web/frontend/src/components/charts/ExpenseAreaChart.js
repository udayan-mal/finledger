"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

const defaultData = [
  { month: "Jan", income: 0, expense: 0 },
  { month: "Feb", income: 0, expense: 0 },
  { month: "Mar", income: 0, expense: 0 },
  { month: "Apr", income: 0, expense: 0 },
  { month: "May", income: 0, expense: 0 },
  { month: "Jun", income: 0, expense: 0 }
];

export default function ExpenseAreaChart({ data }) {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6c364" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#e6c364" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="rgba(201,168,76,0.08)"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "#d0c5b2", fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: "rgba(77,70,55,0.3)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#d0c5b2", fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1e1e2c",
            border: "1px solid rgba(201,168,76,.2)",
            color: "#e3e0f4",
            borderRadius: "6px",
            fontFamily: "JetBrains Mono",
            fontSize: "12px"
          }}
          formatter={(value) => [`₹${value.toFixed(2)}`, undefined]}
          labelStyle={{ color: "#c9a84c", fontWeight: 700 }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ paddingBottom: "10px", fontFamily: "JetBrains Mono", fontSize: "11px" }}
          iconType="line"
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#e6c364"
          fill="url(#incomeGrad)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="#ef4444"
          fill="url(#expenseGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
