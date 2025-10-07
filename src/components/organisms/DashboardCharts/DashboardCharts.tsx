import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Typography } from '../../atoms/Typography'

interface ChartData {
  name: string
  value: number
  color: string
}

interface DashboardChartsProps {
  depositsData: ChartData[]
  paymentsData: ChartData[]
  feesData: ChartData[]
  unitStatusData: {
    name: string
    sold: number
    unsold: number
    finalized: number
    expired: number
    cancelled: number
  }[]
  guaranteeStatusData: { name: string; value: number; color: string }[]
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  depositsData,
  paymentsData,
  feesData,
  unitStatusData,
  guaranteeStatusData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Total Deposits Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Typography variant="h4" className="mb-4">
          Total Deposits (Main A/C)
        </Typography>
        <Typography variant="h3" className="mb-2 text-green-600">
          ₹ 2,04,10,60,800
        </Typography>
        <Typography variant="caption" className="text-gray-500 mb-4">
          ↗ 95% vs last month
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={depositsData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {depositsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4">
          {depositsData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Typography variant="caption">{item.name}</Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Total Payments Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Typography variant="h4" className="mb-4">
          Total Payments (Main A/C)
        </Typography>
        <Typography variant="h3" className="mb-2 text-purple-600">
          ₹ 2,04,10,60,800
        </Typography>
        <Typography variant="caption" className="text-gray-500 mb-4">
          ↗ 95% vs last month
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={paymentsData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {paymentsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4">
          {paymentsData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Typography variant="caption">{item.name}</Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Total Fees Collected Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Typography variant="h4" className="mb-4">
          Total Fees Collected (Main A/C)
        </Typography>
        <Typography variant="h3" className="mb-2 text-blue-600">
          ₹ 2,04,10,60,800
        </Typography>
        <Typography variant="caption" className="text-gray-500 mb-4">
          ↗ 95% vs last month
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={feesData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {feesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4">
          {feesData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Typography variant="caption">{item.name}</Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Status Count */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 lg:col-span-2">
        <Typography variant="h4" className="mb-4">
          Unit Status Count
        </Typography>
        <Typography variant="h3" className="mb-6">
          20678
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={unitStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="sold" fill="#8884d8" />
            <Bar dataKey="unsold" fill="#82ca9d" />
            <Bar dataKey="finalized" fill="#ffc658" />
            <Bar dataKey="expired" fill="#ff7300" />
            <Bar dataKey="cancelled" fill="#413ea0" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Guarantee Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Typography variant="h4" className="mb-4">
          Guarantee Status
        </Typography>
        <Typography variant="h3" className="mb-6">
          14679
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={guaranteeStatusData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
