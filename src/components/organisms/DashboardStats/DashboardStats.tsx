import React from 'react'
import { MetricCard } from '../../molecules/MetricCard'

interface DashboardStatsProps {
  mainTrustAccount: {
    balance: string
    subtitle: string
    trend: { value: string; isPositive: boolean }
  }
  wakalaAccount: {
    balance: string
    subtitle: string
    trend: { value: string; isPositive: boolean }
  }
  corporateAccount: {
    balance: string
    subtitle: string
    trend: { value: string; isPositive: boolean }
  }
  retentionAccount: {
    balance: string
    subtitle: string
  }
  totalStats: {
    developers: number
    projects: number
    activities: number
  }
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  mainTrustAccount,
  wakalaAccount,
  corporateAccount,
  retentionAccount,
  totalStats,
}) => {
  return (
    <div className="space-y-6">
      {/* Account Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Main Trust Account Summary"
          value={mainTrustAccount.balance}
          subtitle={mainTrustAccount.subtitle}
          trend={mainTrustAccount.trend}
          bgColor="bg-blue-50"
        />

        <MetricCard
          title="Wakala Account"
          value={wakalaAccount.balance}
          subtitle={wakalaAccount.subtitle}
          trend={wakalaAccount.trend}
          bgColor="bg-green-50"
        />

        <MetricCard
          title="Corporate Account"
          value={corporateAccount.balance}
          subtitle={corporateAccount.subtitle}
          trend={corporateAccount.trend}
          bgColor="bg-purple-50"
        />

        <MetricCard
          title="Retention Account"
          value={retentionAccount.balance}
          subtitle={retentionAccount.subtitle}
          bgColor="bg-gray-50"
        />
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Developers"
          value={totalStats.developers.toString()}
        />

        <MetricCard
          title="Total Projects"
          value={totalStats.projects.toString()}
        />

        <MetricCard
          title="Total Activities"
          value={totalStats.activities.toString()}
        />
      </div>
    </div>
  )
}
