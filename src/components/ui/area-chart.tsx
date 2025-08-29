"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface AreaChartProps {
  data: Array<{
    month: string
    count: number
  }>
  year: number
}

export function AreaChartComponent({ data, year }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-blue-600 font-medium">
                        Месяц
                      </span>
                      <span className="font-bold text-blue-900">
                        {label}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-blue-600 font-medium">
                        Кэмпов
                      </span>
                      <span className="font-bold text-blue-900">
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#3b82f6" 
          fill="#3b82f6" 
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
