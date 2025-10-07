import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './DataTable'

const meta: Meta<typeof DataTable> = {
  title: 'Organisms/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const mockData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Approved',
    date: '2024-01-15',
    amount: 1250.5,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'Rejected',
    date: '2024-01-16',
    amount: 750.25,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'In Review',
    date: '2024-01-17',
    amount: 2100.75,
  },
]

const columns = [
  { key: 'name', label: 'Name', sortable: true, type: 'text' as const },
  { key: 'email', label: 'Email', sortable: true, type: 'text' as const },
  { key: 'status', label: 'Status', sortable: true, type: 'badge' as const },
  { key: 'date', label: 'Date', sortable: true, type: 'date' as const },
  { key: 'amount', label: 'Amount', sortable: true, type: 'amount' as const },
  { key: 'actions', label: 'Actions', type: 'actions' as const },
]

export const Default: Story = {
  args: {
    data: mockData,
    columns,
  },
}

export const WithoutSearch: Story = {
  args: {
    data: mockData,
    columns,
    searchable: false,
  },
}

export const CustomSearchPlaceholder: Story = {
  args: {
    data: mockData,
    columns,
    searchPlaceholder: 'Search users...',
  },
}
