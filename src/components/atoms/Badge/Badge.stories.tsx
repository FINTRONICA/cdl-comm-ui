import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Approved: Story = {
  args: {
    variant: 'approved',
    children: 'Approved',
  },
}

export const Rejected: Story = {
  args: {
    variant: 'rejected',
    children: 'Rejected',
  },
}

export const Incomplete: Story = {
  args: {
    variant: 'incomplete',
    children: 'Incomplete',
  },
}

export const InReview: Story = {
  args: {
    variant: 'inReview',
    children: 'In Review',
  },
}
