import type { Meta, StoryObj } from '@storybook/react'
import { MetricCard } from './MetricCard'

const meta: Meta<typeof MetricCard> = {
  title: 'Molecules/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: '$1,234,567',
    subtitle: 'This month',
  },
}

export const WithTrend: Story = {
  args: {
    title: 'Main Trust Account',
    value: '₹ 7,20,10,60,800',
    subtitle: 'CRORE',
    trend: {
      value: '95% vs last month',
      isPositive: true,
    },
    bgColor: 'bg-blue-50',
  },
}

export const NegativeTrend: Story = {
  args: {
    title: 'Expenses',
    value: '$234,567',
    subtitle: 'This month',
    trend: {
      value: '12% vs last month',
      isPositive: false,
    },
    bgColor: 'bg-red-50',
  },
}
