import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export function RevenueChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-gray-500">Monthly revenue for the last 6 months</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" /> Revenue
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500" /> Orders
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#6B7280", fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#6B7280", fontSize: 12 }}
            tickFormatter={(value) => `₹${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              borderRadius: "12px", 
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" 
            }}
            formatter={(value, name) => [
              name === "revenue" ? `₹${value.toLocaleString()}` : value,
              name === "revenue" ? "Revenue" : "Orders"
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrderVolumeChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
       <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Order Volume</h3>
          <p className="text-sm text-gray-500">Number of orders per month</p>
        </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#6B7280", fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: "#F3F4F6", radius: 4 }}
            contentStyle={{ 
              backgroundColor: "#fff", 
              borderRadius: "12px", 
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" 
            }}
          />
          <Bar 
            dataKey="orders" 
            fill="#8B5CF6" 
            radius={[4, 4, 0, 0]}
            barSize={40}
            name="Orders"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
