import {
  LayoutDashboard,
  User,
  Building,
  TicketSlash,
  FileText,
  UserCog,
  FileClock,
  SquarePen,
  SquareUserRound,
  HandCoins,
  Landmark,
  UserPen,
  ListChecks,
  Banknote,
  FileChartPie,
  XCircle,
  BriefcaseBusiness,
  CircleUserRound,
  CircleDollarSign,
  ListCheck,
  AlignJustify,
  ShieldCheckIcon,
  Shield,
  Tv,
  Workflow,
  Handshake,
  BanknoteArrowUp,
  UserRoundCheck,
  Signature,
  ArrowsUpFromLine,
  Columns3Cog,
} from 'lucide-react'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  children?: SidebarItem[]
  permissions?: string[]
}

interface SidebarSection {
  id: string
  label: string
  items: SidebarItem[]
  icon: React.ComponentType<{ className?: string }>
  href?: string
  permissions?: string[]
}

type LabelResolver = (sidebarId: string, fallback: string) => string

export const createSidebarConfig = (
  getLabel: LabelResolver
): SidebarSection[] => [
    {
      id: 'dashboard',
      label: getLabel('dashboard', 'Dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      items: [],
      permissions: ['nav_menu_dashboard', 'nav_menu_all'],
    },
    {
      id: 'activity',
      label: getLabel('activity', 'Activity Manager'),
      icon: User,
      permissions: ['*'],
      items: [
        {
          id: 'pending',
          label: getLabel('pending', 'Pending Activities'),
          icon: FileClock,
          href: '/activities/pending',
          permissions: ['nav_menu_task_engaged', 'nav_menu_all'],
        },
        {
          id: 'involved',
          label: getLabel('involved', 'Involved Activities'),
          icon: SquarePen,
          href: '/activities/involved',
          permissions: ['nav_menu_transactions', 'nav_menu_all'],
        },
      ],
    },
    {
      id: 'entities',
      label: getLabel('entities', 'ENTITIES'),
      icon: Building,
      permissions: ['*'],
      items: [
        {
          id: ' Agreement',
          label: getLabel(' Agreement', ' Agreement'),
          icon: Handshake,
          href: '/agreement',
          permissions: ['*']
        },
        {
          id: 'Agreement Signatory',
          label: getLabel('Agreement Signatory', 'Agreement Signatory'),
          icon: UserRoundCheck,
          href: '/agreement-signatory',
          permissions: ['nav_menu_agreement_signatory', 'nav_menu_all']
        },
        {
          id: 'Escrow Account',
          label: getLabel('Agreement Account', 'Agreement Account'),
          icon: Building,
          href: '/escrow-account',
          permissions: ['nav_menu_escrow_account', 'nav_menu_all']
        },

        {
          id: 'Agreement Parameters',
          label: getLabel('Agreement Parameters', 'Agreement Parameters'),
          icon: Signature,
          href: '/agreement-parameter',
          permissions: ['nav_menu_agreement_parameters', 'nav_menu_all']
        },

        {
          id: 'Agreement Fee Schedule',
          label: getLabel('Agreement Fee Schedule', 'Agreement Fee Schedule'),
          icon: BriefcaseBusiness,
          href: '/agreement-fee-schedule',
          permissions: ['nav_menu_agreement_fee_schedule', 'nav_menu_all']
        },
        // {
        //   id: 'developers',
        //   label: getLabel('developers', 'Developers'),
        //   icon: SquareUserRound,
        //   href: '/build-partner',
        //   permissions: ['nav_menu_bp', 'nav_menu_all'],
        // },
        // {
        //   id: 'projects',
        //   label: getLabel('projects', 'Build Partner Assets'),
        //   icon: BriefcaseBusiness,
        //   href: '/build-partner-assets',
        //   permissions: ['nav_menu_bpa', 'nav_menu_all'],
        // },
        // {
        //   id: 'investors',
        //   label: getLabel('investors', 'Investor'),
        //   icon: CircleUserRound,
        //   href: '/capital-partner',
        //   permissions: ['nav_menu_cp', 'nav_menu_all'],
        // },
        // {
        //   id: 'Agreement Beneficiary',
        //   label: getLabel('Agreement Beneficiary', 'Agreement Beneficiary'),
        //   icon: SquareUserRound,
        //   href: '/agreement-beneficiary',
        //   permissions: ['nav_menu_agreement_beneficiary', 'nav_menu_all']
        // },
      ],
    },
    {
      id: 'master',
      label: getLabel('master', 'MASTER'),
      icon: Columns3Cog,
      permissions: ['*'],
      items: [
        {
          id: 'master',
          label: getLabel('customer', 'Customer'),
          icon: SquareUserRound,
          href: '/master',
          permissions: ['*'], // Temporarily set to allow all users
        }

      ],
    },
    {
      id: 'deposits',
      label: getLabel('deposits', 'DEPOSITS'),
      icon: CircleDollarSign,
      permissions: ['*'],
      items: [
        {
          id: 'unallocated',
          label: getLabel('unallocated', 'Unallocated Transaction'),
          icon: AlignJustify,
          href: '/transactions/unallocated',
          permissions: ['nav_menu_pending_tran', 'nav_menu_all'],
        },
       
        {
          id: 'allocated',
          label: getLabel('allocated', 'Allocated Transaction'),
          icon: ListCheck,
          href: '/transactions/allocated',
          permissions: ['nav_menu_processed_tran', 'nav_menu_all'],
        },
         // {
        //   id: 'discarded',
        //   label: getLabel('discarded', 'Discarded Transaction'),
        //   icon: XCircle,
        //   href: '/transactions/discarded',
        //   permissions: ['nav_menu_discarded_tran', 'nav_menu_all'],
        // },
        // {
        //   id: 'manual',
        //   label: getLabel('manual', 'Manual Payment'),
        //   icon: HandCoins,
        //   href: '/transactions/manual',
        //   permissions: ['nav_menu_manual_payment', 'nav_menu_all'],
        // },
        // {
        //   id: 'tas',
        //   label: getLabel('tas', 'TAS Payment'),
        //   icon: FileText,
        //   href: '/transactions/tas',
        //   permissions: ['nav_menu_tas_payment', 'nav_menu_all'],
        // },
        // {
        //   id: 'fee-reconciliation',
        //   label: getLabel('fee-reconciliation', 'Fee Reconciliation'),
        //   icon: TicketSlash,
        //   href: '/transactions/fee-reconciliation',
        //   permissions: ['nav_menu_fees', 'nav_menu_all'],
        // },
      ],
    },
    {
      id: 'payment',
      label: getLabel('payment', 'PAYMENTS'),
      icon: HandCoins,
      permissions: ['*'],
      items: [
        {
          id: 'payment-beneficiary',
          label: getLabel('payment-beneficiary', 'Payment Beneficiary'),
          icon: AlignJustify,
          href: '/payment-beneficiary',
          permissions: ['*'],
        },
        {
          id: 'payment-instruction',
          label: getLabel('payment-instruction', 'Payment Instruction'),
          icon: AlignJustify,
          href: '/payment-instruction',
          permissions: ['*'],
        },
      ],
    },

    {
      id: 'reports',
      label: getLabel('reports', 'REPORTS'),
      icon: FileText,
      permissions: ['*'],
      items: [
        {
          id: 'business',
          label: getLabel('business', 'Business Report'),
          icon: FileChartPie,
          href: '/reports/business',
          permissions: ['nav_menu_reports', 'nav_menu_all'],
        },
      ],
    },
    // {
    //   id: 'guarantee',
    //   label: getLabel('guarantee', 'Guarantee'),
    //   icon: ShieldCheckIcon,
    //   href: '/surety_bond',
    //   items: [],
    //   permissions: ['nav_menu_surety_bond', 'nav_menu_all'],
    // },

    {
      id: 'system-admin',
      label: getLabel('system-admin', 'SYSTEM ADMIN'),
      icon: UserCog,
      permissions: ['*'],

      items: [
        {
          id: 'user',
          label: getLabel('user', 'User Management'),
          icon: UserPen,
          href: '/admin/stakeholder',
          permissions: ['nav_menu_system_admin', 'nav_menu_all'],
        },
        {
          id: 'role',
          label: getLabel('role', 'Role Management'),
          icon: ListChecks,
          href: '/admin/entitlement',
          permissions: ['nav_menu_system_admin', 'nav_menu_all'],
        },
        {
          id: 'fee-type',
          label: getLabel('fee-type', 'Fee Type'),
          icon: Banknote,
          href: '/admin/access-grant',
          permissions: ['nav_menu_fees', 'nav_menu_all'],
        },

        {
          id: 'workflow',
          label: getLabel('workflow', 'WORKFLOW'),
          icon: Workflow,
          permissions: ['nav_menu_workflow', 'nav_menu_all'],
          children: [
            {
              id: 'workflow-action',
              label: getLabel('action', 'Action'),
              icon: BanknoteArrowUp,
              href: '/admin/workflow/action',
              permissions: ['nav_menu_workflow_action', 'nav_menu_all'],
            },
            {
              id: 'workflow-definition',
              label: getLabel('definition', 'Definition'),
              icon: Tv,
              href: '/admin/workflow/definition',
              permissions: ['nav_menu_workflow_definition', 'nav_menu_all'],
            },

            {
              id: 'workflow-stage-template',
              label: getLabel('stage-template', 'Stage Template'),
              icon: ArrowsUpFromLine,
              href: '/admin/workflow/stage-template',
              permissions: ['nav_menu_workflow_stage_template', 'nav_menu_all'],
            },
            {
              id: 'workflow-amount-rule',
              label: getLabel('amount-rule', 'Amount Rule'),
              icon: HandCoins,
              href: '/admin/workflow/amount-rule',
              permissions: ['nav_menu_workflow_amount_rule', 'nav_menu_all'],
            },
            {
              id: 'amount-stage-overrides',
              label: getLabel('amount-stage-overrides', 'Amount Stage'),
              icon: Banknote,
              href: '/admin/workflow/amount-stage-override',
              permissions: [
                'nav_menu_workflow_amount_stage_override',
                'nav_menu_all',
              ],
            },
          ],
        },
      ],
    },
  ]

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    items: [],
  },
  {
    id: 'activity',
    label: 'Activity Manager',
    icon: User,
    items: [
      {
        id: 'pending',
        label: 'Pending Activities',
        icon: FileClock,
        href: '/activities/pending',
      },
      {
        id: 'involved',
        label: 'Involved Activities',
        icon: SquarePen,
        href: '/activities/involved',
      },
    ],
  },
  {
    id: 'entities',
    label: 'ENTITIES',
    icon: Building,
    items: [
      
      {
        id: ' Agreement',
        label: 'Agreement',
        icon: SquareUserRound,
        href: '/agreement',
      },
      {
        id: 'Agreement Signatory',
        label: 'Agreement Signatory',
        icon: SquareUserRound,
        href: '/agreement-signatory',
      },
      {
        id: 'Escrow Account',
        label: 'Escrow Account',
        icon: Building,
        href: '/escrow-account',
      },

      {
        id: 'Agreement Parameters',
        label: 'Agreement Parameters',
        icon: CircleUserRound,
        href: '/agreement-parameter',
      },

      {
        id: 'Agreement Fee Schedule',
        label: 'Agreement Fee Schedule',
        icon: BriefcaseBusiness,
        href: '/agreement-fee-schedule',
      },
    ],
  },
  {
    id: 'master',
    label: 'master',
    icon: Building,
    items: [
      {
        id: 'master',
        label: 'Customer',
        icon: SquareUserRound,
        href: '/master',
      }
    ],
  },
  {
    id: 'deposits',
    label: 'DEPOSITS',
    icon: CircleDollarSign,
    items: [
      {
        id: 'unallocated',
        label: 'Unallocated Transaction',
        icon: AlignJustify,
        href: '/transactions/unallocated',
      },
      {
        id: 'allocated',
        label: 'Allocated Transaction',
        icon: ListCheck,
        href: '/transactions/allocated',
      },     
    ],
  },
  // {
  //   id: 'guarantee',
  //   label: 'Guarantee',
  //   icon: ShieldCheckIcon,
  //   href: '/surety_bond',
  //   items: [],
  // },
  // {
  //   id: 'fee-reconciliation',
  //   label: 'Fee Reconciliation',
  //   icon: TicketSlash,
  //   href: '/fee-reconciliation',
  //   items: [],
  // },
  {
    id: 'reports',
    label: 'REPORTS',
    icon: FileText,
    items: [
      {
        id: 'business',
        label: 'Business Report',
        icon: FileChartPie,
        href: '/reports/business',
      },
    ],
  },
  {
    id: 'system-admin',
    label: 'SYSTEM ADMIN',
    icon: UserCog,
    items: [
      {
        id: 'bank',
        label: 'Bank Management',
        icon: Landmark,
        href: '/admin/bank-management',
      },
      {
        id: 'user',
        label: 'User Management',
        icon: UserPen,
        href: '/admin/stakeholder',
      },
      {
        id: 'role',
        label: 'Role Management',
        icon: ListChecks,
        href: '/admin/entitlement',
      },
      {
        id: 'fee-type',
        label: 'Fee Type',
        icon: Banknote,
        href: '/admin/access-grant',
      },
      {
        id: 'security',
        label: 'Security',
        icon: Shield,
        href: '/admin/security',
      },
      {
        id: 'workflow',
        label: 'WORK FLOW',
        icon: Workflow,

        children: [
          {
            id: 'workflow-action',
            label: 'Action',
            icon: BanknoteArrowUp,
            href: '/admin/workflow/action',
          },
          {
            id: 'workflow-definition',
            label: 'Definition',
            icon: Tv,
            href: '/admin/workflow/definition',
          },

          {
            id: 'workflow-stage-template',
            label: 'Stage Template',
            icon: ArrowsUpFromLine,
            href: '/admin/workflow/stage-template',
          },
          {
            id: 'workflow-amount-rule',
            label: 'Amount Rule',
            icon: HandCoins,
            href: '/admin/workflow/amount-rule',
          },
          {
            id: 'amount-stage-overrides',
            label: 'Amount Stage ',
            icon: UserPen,
            href: '/admin/workflow/amount-stage-override',
          },
        ],
      },
    ],
  },
] as const

export type { SidebarItem, SidebarSection, LabelResolver }
