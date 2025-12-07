# Escrow Central - Financial Escrow Management System

[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-brightgreen.svg)](https://github.com/your-org/escrow)
[![Compliance](https://img.shields.io/badge/Compliance-PCI--DSS%20%7C%20ISO%2027001%20%7C%20SOC%202%20%7C%20GDPR-blue.svg)](https://github.com/your-org/escrow)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive, enterprise-grade financial escrow management system built with Next.js, featuring advanced security, compliance, and real-time monitoring capabilities.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Routing Architecture](#routing-architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Authentication & Authorization](#authentication--authorization)
- [API Integration](#api-integration)
- [Component Architecture](#component-architecture)
- [Form Handling & Validation](#form-handling--validation)
- [Internationalization](#internationalization)
- [Data Flow & Patterns](#data-flow--patterns)
- [Development Workflow](#development-workflow)
- [Configuration](#configuration)
- [Code Conventions](#code-conventions)
- [Common Tasks & How-Tos](#common-tasks--how-tos)
- [Contributing](#contributing)
- [Support](#support)

## Features

### **Core Escrow Management**

- **Transaction Management**: Complete lifecycle management of escrow transactions
- **Project Tracking**: Real-time project status and milestone tracking
- **Payment Processing**: Secure payment handling with multiple payment methods
- **Investor Management**: Comprehensive investor onboarding and management
- **Build Partner Management**: Developer/build partner onboarding with multi-step forms
- **Capital Partner Management**: Investor and capital partner management
- **Reporting & Analytics**: Advanced reporting with customizable dashboards
- **User Management**: Role-based access control with granular permissions
- **Workflow Management**: Configurable workflow system for transaction processing
- **Document Management**: Secure document upload and management system

## Architecture

```
escrow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes with security
│   │   ├── admin/             # Admin dashboard routes
│   │   │   ├── bank-management/
│   │   │   ├── access-grant/
│   │   │   ├── stakeholder/   # User/stakeholder management
│   │   │   ├── entitlement/
│   │   │   ├── security/
│   │   │   └── workflow/      # Workflow management routes
│   │   ├── dashboard/         # Main dashboard
│   │   ├── (entities)/        # Route group for entity management
│   │   │   ├── build-partner/    # Build partner/developer management
│   │   │   │   ├── page.tsx      # List page (/build-partner)
│   │   │   │   ├── new/          # Create new (/build-partner/new)
│   │   │   │   └── [id]/         # Detail pages
│   │   │   │       └── step/     # Multi-step forms
│   │   │   │           └── [stepNumber]/page.tsx
│   │   │   ├── build-partner-assets/  # Build partner assets management
│   │   │   │   ├── page.tsx      # List page (/build-partner-assets)
│   │   │   │   ├── new/          # Create new (/build-partner-assets/new)
│   │   │   │   └── [id]/         # Detail pages (/build-partner-assets/{id})
│   │   │   └── capital-partner/      # Capital partner management
│   │   │       ├── page.tsx      # List page (/capital-partner)
│   │   │       ├── new/          # Create new (/capital-partner/new)
│   │   │       └── [id]/         # Detail pages
│   │   │           ├── page.tsx   # Capital partner details
│   │   │           └── step/      # Multi-step forms
│   │   │               └── [stepNumber]/page.tsx
│   │   ├── transactions/      # Transaction management routes
│   │   │   ├── unallocated/   # Unallocated transactions
│   │   │   │   └── [id]/      # Transaction details
│   │   │   ├── allocated/     # Allocated transactions
│   │   │   ├── discarded/     # Discarded transactions
│   │   │   ├── manual/        # Manual payment transactions
│   │   │   │   ├── new/       # Create new manual payment
│   │   │   │   │   └── [id]/  # Manual payment form
│   │   │   │   └── page.tsx   # Manual payment list
│   │   │   ├── tas/           # TAS payment transactions
│   │   │   │   ├── new/       # Create new TAS payment
│   │   │   │   │   └── [id]/  # TAS payment form
│   │   │   │   └── page.tsx   # TAS payment list
│   │   │   └── fee-reconciliation/  # Fee reconciliation
│   │   ├── activities/        # Activity management
│   │   │   ├── pending/       # Pending activities
│   │   │   └── involved/      # Involved activities
│   │   ├── reports/           # Reporting
│   │   │   └── business/      # Business reports
│   │   │       └── [reportId]/  # Specific report
│   │   ├── surety_bond/       # Surety bond management
│   │   │   ├── new/           # Create new surety bond
│   │   │   │   └── [id]/      # Surety bond form
│   │   │   └── page.tsx       # Surety bond list
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   ├── refresh/
│   │   │   │   └── heartbeat/
│   │   │   ├── transactions/  # Transaction API
│   │   │   └── test/          # Test endpoint
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable UI components
│   │   ├── atoms/            # Atomic design - basic components (~28-30 components)
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Label/
│   │   │   └── ...
│   │   ├── molecules/        # Composite components (~25-26 components)
│   │   │   ├── SearchBar/
│   │   │   ├── FormField/
│   │   │   ├── Card/
│   │   │   └── ...
│   │   ├── organisms/        # Complex components (~30+ components)
│   │   │   ├── ProjectStepper/      # Multi-step project forms
│   │   │   ├── DeveloperStepper/    # Multi-step developer forms
│   │   │   ├── PermissionAwareDataTable/  # Permission-aware tables
│   │   │   ├── DocumentUpload/      # Document upload system
│   │   │   ├── RightSlidePanel/     # Slide-out detail panels
│   │   │   └── ...
│   │   ├── templates/        # Page templates
│   │   ├── providers/       # Context providers
│   │   └── index.ts         # Barrel exports
│   ├── lib/                  # Core libraries
│   │   ├── auth.ts           # Authentication system
│   │   ├── encryption.ts     # Data encryption (AES-256-GCM)
│   │   ├── apiClient.ts      # Axios-based API client
│   │   ├── apiSecurity.ts    # API security utilities
│   │   ├── securityMonitor.ts # Security monitoring
│   │   ├── auditLogger.ts    # Audit logging
│   │   ├── sessionManager.ts # Session management
│   │   ├── privacy.ts        # GDPR privacy service
│   │   ├── validation.ts      # Input validation utilities
│   │   └── validation/        # Zod validation schemas (~20 files)
│   ├── middleware.ts          # Next.js middleware (auth & security)
│   ├── middleware/            # Middleware utilities
│   │   └── auth.ts           # Authentication middleware
│   ├── config/               # Configuration files
│   │   ├── api.ts           # API configuration
│   │   ├── environment.ts   # Environment configuration
│   │   └── reportsConfig.ts # Reports configuration
│   ├── constants/            # Configuration constants
│   │   ├── apiEndpoints.ts  # API endpoint definitions (811 lines)
│   │   ├── sidebarConfig.ts # Sidebar navigation configuration
│   │   └── mappings/        # Data mapping configurations (19 files)
│   ├── hooks/                # Custom React hooks (~85-90 hooks)
│   │   ├── useBuildPartners.ts
│   │   ├── useTableState.ts
│   │   ├── useSidebarConfig.ts
│   │   └── ...
│   ├── services/            # API service layer
│   │   ├── api/             # API services (73 services)
│   │   │   ├── authService.ts
│   │   │   ├── transactionService.ts
│   │   │   ├── buildPartnerService.ts
│   │   │   ├── projectService.ts
│   │   │   ├── workflowApi/  # Workflow-related services
│   │   │   └── ...
│   │   ├── sessionService.ts
│   │   ├── cookieService.ts
│   │   └── ...
│   ├── store/               # Zustand state management
│   │   ├── index.ts         # Main store configuration
│   │   ├── authStore.ts     # Authentication state
│   │   ├── permissionsStore.ts      # Permissions state
│   │   ├── reactivePermissionsStore.ts  # Reactive permissions
│   │   ├── sidebarLabelsStore.ts    # Sidebar labels
│   │   ├── notificationStore.ts    # Notifications
│   │   ├── confirmationDialogStore.ts  # Confirmation dialogs
│   │   └── slices/          # Store slices
│   │       ├── userSlice.ts
│   │       ├── projectSlice.ts
│   │       ├── transactionSlice.ts
│   │       ├── uiSlice.ts
│   │       └── labelsSlice.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── permissions.ts
│   │   ├── userManagement.ts
│   │   ├── bank.ts
│   │   ├── activities.ts
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── cookieUtils.ts
│   │   ├── jwtParser.ts
│   │   ├── navigation.ts
│   │   ├── sidebarPermissions.ts
│   │   ├── statusUtils.ts
│   │   └── ...
│   ├── controllers/         # Controller layer
│   │   ├── authController.ts
│   │   ├── sessionController.ts
│   │   └── userController.ts
│   ├── models/              # Data models
│   │   ├── Auth.ts
│   │   ├── Session.ts
│   │   └── User.ts
│   └── data/                # Mock/static data
│       ├── activitiesData.ts
│       └── projectsData.ts
├── public/                  # Static assets
│   ├── locales/            # i18n translation files
│   │   ├── en/common.json
│   │   └── es/common.json
│   └── [images, icons, etc.]
├── .env.local              # Environment variables (not in git)
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── eslint.config.mjs       # ESLint configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Routing Architecture

### **Next.js App Router with Route Groups**

The application uses Next.js 15 App Router with route groups for clean URL structures:

#### **Route Groups**

- `(entities)`: Groups entity management routes without adding `/entities` to the URL
  - `/build-partner` instead of `/entities/build-partner`
  - `/build-partner-assets` instead of `/entities/build-partner-assets`
  - `/capital-partner` instead of `/entities/capital-partner`

#### **Entity Management Routes**

**Build Partners** (also referred to as "Developers" in the UI)

- **List**: `/build-partner` - Main build partners list page
- **New**: `/build-partner/new` - Create new build partner form
- **Details**: `/build-partner/{id}/step/{stepNumber}` - Multi-step forms
  - **Edit Mode**: `/build-partner/{id}/step/{stepNumber}?editing=true`
  - **View Mode**: `/build-partner/{id}/step/{stepNumber}?mode=view`

**Build Partner Assets** (also referred to as "Projects" in the UI)

- **List**: `/build-partner-assets` - Assets list page
- **New**: `/build-partner-assets/new` - Create new asset
- **Details**: `/build-partner-assets/{id}` - Asset details

**Capital Partners** (also referred to as "Investor" in the UI)

- **List**: `/capital-partner` - Capital partners list
- **New**: `/capital-partner/new` - Create new capital partner form
- **Details**: `/capital-partner/{id}` - Capital partner details
  - **Step Forms**: `/capital-partner/{id}/step/{stepNumber}` - Multi-step forms

#### **Admin Routes**

- `/admin/bank-management` - Bank management
- `/admin/access-grant` - Access grant management
- `/admin/stakeholder` - User management (stakeholder management)
- `/admin/entitlement` - Entitlement management
- `/admin/security` - Security dashboard
- `/admin/workflow/action` - Workflow action management
- `/admin/workflow/amount-rule` - Workflow amount rule management
- `/admin/workflow/amount-stage-override` - Workflow amount stage override management
- `/admin/workflow/definition` - Workflow definition management
- `/admin/workflow/stage-template` - Workflow stage template management

#### **Transaction Routes**

- `/transactions/unallocated` - Unallocated transactions list
  - `/transactions/unallocated/[id]` - Unallocated transaction details
- `/transactions/allocated` - Allocated transactions list
- `/transactions/discarded` - Discarded transactions list
- `/transactions/manual` - Manual payment transactions list
  - `/transactions/manual/new` - Create new manual payment
  - `/transactions/manual/new/[id]` - Manual payment form/processing
- `/transactions/tas` - TAS payment transactions list
  - `/transactions/tas/new` - Create new TAS payment
  - `/transactions/tas/new/[id]` - TAS payment form/processing
- `/transactions/fee-reconciliation` - Fee reconciliation

#### **Other Routes**

- `/dashboard` - Main dashboard
- `/activities/pending` - Pending activities
- `/activities/involved` - Involved activities
- `/reports/business` - Business reports list
  - `/reports/business/[reportId]` - Specific business report
- `/surety_bond` - Surety bond management list
  - `/surety_bond/new` - Create new surety bond
  - `/surety_bond/new/[id]` - Surety bond form/processing
- `/help` - Help page
- `/login` - Login page

#### **Route Group Benefits**

- **Clean URLs**: No `/entities` prefix in the URL
- **Better Breadcrumbs**: Improved navigation structure
- **Organized Code**: Logical grouping of related routes
- **SEO Friendly**: Clean, semantic URL structure

#### **Navigation Flow Example**

```
Dashboard → Build Partners List → Build Partner Details → Edit/View
    ↓              ↓                      ↓
/build-partner → /build-partner/{id}/step/1 → /build-partner/{id}/step/2
```

## Technology Stack

### **Frontend Framework**

- **Next.js 15.3.5**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5.8.3**: Type-safe development with strict mode

### **Styling**

- **Tailwind CSS 4**: Utility-first CSS framework
- **Material-UI (MUI)**: Component library (`@mui/material`, `@mui/icons-material`)
- **MUI Date Pickers**: Date/time picker components
- **Styled Components**: CSS-in-JS (legacy support)

### **State Management**

- **Zustand 5.0.2**: Lightweight state management
- **TanStack React Query 5.84.1**: Server state management and caching

### **Form Handling**

- **React Hook Form 7.54.2**: Form state management
- **Zod 4.0.15**: Schema validation
- **@hookform/resolvers**: Zod resolver for React Hook Form

### **HTTP Client**

- **Axios 1.10.0**: HTTP client with interceptors

### **Security & Authentication**

- **jsonwebtoken 9.0.2**: JWT token handling
- **bcryptjs 3.0.2**: Password hashing
- **crypto-js 4.2.0**: Encryption utilities
- **isomorphic-dompurify 2.26.0**: HTML sanitization

### **UI Components & Icons**

- **Lucide React 0.525.0**: Icon library
- **React Hot Toast 2.5.2**: Toast notifications
- **Highcharts 12.4.0**: Chart library
- **Recharts 3.1.0**: Chart library

### **Internationalization**

- **next-i18next 15.4.2**: i18n support

### **Utilities**

- **dayjs 1.11.13**: Date manipulation
- **js-cookie 3.0.5**: Cookie management
- **clsx 2.1.1**: Conditional class names
- **tailwind-merge 3.3.1**: Tailwind class merging

### **Development Tools**

- **ESLint 9**: Code linting
- **Prettier 3.6.2**: Code formatting
- **Storybook 8.6.14**: Component documentation
- **TypeScript**: Static type checking

## Installation

### Prerequisites

- **Node.js 18+** (recommended: Node.js 20+)
- **npm** or **yarn** package manager
- **Git** for version control

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/escrow.git
   cd escrow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Application Configuration
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NODE_ENV=development

   # Security Configuration
   JWT_SECRET=your-super-secure-jwt-secret-change-in-production
   JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
   ENCRYPTION_KEY=your-32-character-encryption-key-here
   SESSION_SECRET=your-session-secret-change-in-production

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Compliance
   AUDIT_LOG_ENABLED=true
   GDPR_ENABLED=true
   SECURITY_MONITORING_ENABLED=true

   # HTTPS Enforcement (Production)
   FORCE_HTTPS=true
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### **Development**

```bash
npm run dev              # Start development server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
```

## Project Structure

### **Key Directories**

#### **`src/app/`** - Next.js App Router Pages

- Contains all page components and route definitions
- Uses App Router conventions (page.tsx, layout.tsx)
- Route groups for organization: `(entities)`

#### **`src/components/`** - UI Components

- **`atoms/`**: Basic, reusable components (Button, Input, Label)
- **`molecules/`**: Composite components (SearchBar, FormField, Card)
- **`organisms/`**: Complex components (DataTable, Stepper, Dashboard)
- **`templates/`**: Page-level templates (DashboardLayout)
- **`providers/`**: React context providers

#### **`src/lib/`** - Core Libraries

- Authentication, encryption, validation utilities
- API client configuration
- Security and compliance services

#### **`src/services/api/`** - API Service Layer

- 73+ service files organized by domain
- Each entity has its own service file
- Centralized API communication logic

#### **`src/store/`** - State Management

- Zustand store configuration
- Store slices for different domains
- Selectors and actions

#### **`src/hooks/`** - Custom React Hooks

- ~85-90 custom hooks for business logic
- Reusable hooks for common patterns
- Domain-specific hooks
- Workflow hooks in `hooks/workflow/` subdirectory

#### **`src/constants/`** - Configuration Constants

- API endpoints (811 lines)
- Sidebar configuration
- Data mappings

#### **`src/types/`** - TypeScript Types

- Type definitions for all domains
- Shared interfaces and types

#### **`src/utils/`** - Utility Functions

- Helper functions
- Data transformation utilities
- Navigation utilities

## State Management

### **Zustand Store Architecture**

The application uses Zustand for client-side state management with a slice-based architecture:

#### **Store Slices** (`src/store/slices/`)

- **`userSlice.ts`**: User data and authentication state
- **`projectSlice.ts`**: Project management state
- **`transactionSlice.ts`**: Transaction data
- **`uiSlice.ts`**: UI state (theme, language, sidebar, modals)
- **`labelsSlice.ts`**: Dynamic labels (session-only)

#### **Store Configuration** (`src/store/index.ts`)

- Combined store with all slices
- Persistence middleware (localStorage)
- Memoized selectors for performance
- Memoized action hooks

#### **Important Patterns**

**Persistence**

- Only user, theme, and language are persisted
- Labels are **NOT persisted** (banking compliance requirement)
- Labels are fetched fresh on each app load

**Selectors**

- Memoized selectors prevent unnecessary re-renders
- Example: `useUser()`, `useProjects()`, `useTransactions()`

**Actions**

- Memoized action hooks prevent infinite loops
- Example: `useUserActions()`, `useProjectActions()`

**Labels Store**

- Session-only labels for compliance
- Multiple label stores for different entities:
  - Sidebar labels
  - Build partner labels
  - Capital partner labels
  - Workflow labels
  - etc.

#### **Usage Example**

```typescript
// Using selectors
const user = useUser()
const projects = useProjects()

// Using actions
const { setUser, logout } = useUserActions()
const { setProjects, addProject } = useProjectActions()

// Using labels (session-only)
const { sidebarLabels, buildPartnerLabels } = useLabels()
```

### **React Query (TanStack Query)**

Used for server state management:

- API data caching
- Automatic refetching
- Optimistic updates
- Loading and error states

## Authentication & Authorization

### **Authentication Flow**

1. **Login**: User submits credentials → `/api/auth/login`
2. **Token Storage**: JWT token stored in HTTP-only cookies
3. **Middleware Validation**: `src/middleware.ts` validates token on every request
4. **Token Expiration**: Auto-redirect to login if token expired
5. **Protected Routes**: Redirect to login with `redirect` query param

### **Middleware** (`src/middleware.ts`)

The middleware handles:

- Token validation and expiration checks
- Route protection (public vs protected routes)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- HTTPS enforcement in production
- Cookie management

### **Permission System**

#### **Roles**

- **Admin**: Full system access
- **Manager**: Management-level access
- **Maker**: Create/edit transactions
- **Checker**: Review and approve transactions

#### **Permission-Based Access**

- Granular permissions (e.g., `create_user`, `read_transaction`)
- Permission checks at component level
- Permission-aware data tables
- Permission-aware buttons

#### **Permission Components**

- **`PermissionAwareDataTable`**: Data tables that respect permissions
- **`PermissionButton`**: Buttons that check permissions before rendering
- **`ReactivePermissionsProvider`**: Reactive permission checking

#### **Permission Stores**

- **`permissionsStore.ts`**: User permissions store
- **`reactivePermissionsStore.ts`**: Reactive permission checks
- Permission utilities in `src/utils/sidebarPermissions.ts`

### **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with 10,000 iterations
- **Token Expiration**: Automatic token validation and refresh
- **Session Management**: Secure session handling
- **Security Headers**: Comprehensive security headers
- **Input Validation**: Zod schemas for all inputs
- **XSS Protection**: HTML sanitization with DOMPurify
- **CSRF Protection**: Origin validation

## API Integration

### **API Client** (`src/lib/apiClient.ts`)

Centralized API client built on Axios:

- Automatic token injection from cookies
- Request/response interceptors
- Error handling with banking-specific error codes
- Retry logic (3 attempts with exponential backoff)
- Request/response logging
- Timeout handling (30 seconds)

### **API Services** (`src/services/api/`)

73+ service files organized by domain:

- **Authentication**: `authService.ts`, `authAdminUserService.ts`
- **Transactions**: `transactionService.ts`, `pendingTransactionService.ts`
- **Projects**: `projectService.ts`
- **Build Partners**: `buildPartnerService.ts`
- **Capital Partners**: `capitalPartnerService.ts`
- **Workflows**: `workflowApi/` directory
- **Labels**: Various label services
- And many more...

### **API Endpoints** (`src/constants/apiEndpoints.ts`)

Centralized endpoint definitions (811 lines):

- Organized by controller/domain
- Dynamic endpoints with functions: `GET_BY_ID: (id: string) => \`/endpoint/${id}\``
- Base URL: Environment-based (`NEXT_PUBLIC_API_URL`)
- API prefix: `/api/v1`

### **API Configuration**

- **`src/constants/apiEndpoints.ts`**: Main API endpoint definitions (811 lines)
  - Organized by controller/domain
  - Dynamic endpoint functions
  - Query parameter helpers
- **`src/config/api.ts`**: Basic API configuration
  - Base URL defaults
  - Timeout settings (10 seconds)
  - Retry configuration
- **`src/lib/apiClient.ts`**: Actual API client implementation
  - Uses timeout of 30 seconds for banking operations
  - Automatic token injection
  - Error handling and retry logic

### **Usage Example**

```typescript
import { buildPartnerService } from '@/services/api'

// Fetch build partners
const partners = await buildPartnerService.getBuildPartners(filters)

// Create build partner
const newPartner = await buildPartnerService.createBuildPartner(data)
```

## Component Architecture

### **Atomic Design Pattern**

The component library follows atomic design principles:

#### **Atoms** (`src/components/atoms/`)

Basic, reusable UI components:

- Button, Input, Label, Checkbox, Radio, etc.
- ~28-30 atom components

#### **Molecules** (`src/components/molecules/`)

Composite components built from atoms:

- SearchBar, FormField, Card, Dropdown, etc.
- ~25-26 molecule components

#### **Organisms** (`src/components/organisms/`)

Complex components built from molecules and atoms:

- **`ProjectStepper`**: Multi-step project creation form
- **`DeveloperStepper`**: Multi-step developer onboarding (for build partners)
- **`PermissionAwareDataTable`**: Data table with permission checks
- **`DocumentUpload`**: Document upload with confirmation
- **`RightSlidePanel`**: Slide-out panels for details
- **`DashboardCharts`**: Dashboard visualization components
- **`InvestorStepper`**: Multi-step investor/capital partner onboarding
- **`ManualPaymentStepper`**: Manual payment processing stepper
- **`TasPaymentStepper`**: TAS payment processing stepper
- **`GuaranteeStepper`**: Surety bond guarantee stepper
- ~30+ organism components

### **Key Component Patterns**

#### **Stepper Components**

Multi-step forms with validation:

- Step-by-step navigation
- Form state management
- Validation at each step
- Progress tracking

#### **Data Tables**

- Permission-aware tables
- Sorting, filtering, pagination
- Expandable rows
- Action buttons

#### **Slide Panels**

- Right slide panels for details
- Left slide panels for filters
- Smooth animations
- Responsive design

### **Component Best Practices**

- **Co-location**: Related files grouped together
- **Barrel Exports**: `index.ts` files for clean imports
- **TypeScript**: All components fully typed
- **Props Interfaces**: Explicit prop types
- **Error Boundaries**: Error handling at component level
- **Lazy Loading**: Components loaded on demand

## Form Handling & Validation

### **Form Libraries**

- **React Hook Form**: Form state management
- **Zod**: Schema validation (v4.0.15)
- **@hookform/resolvers**: Zod resolver for React Hook Form

### **Validation Patterns**

#### **Validation Schemas** (`src/lib/validation/`)

- ~20 validation schema files
- Domain-specific schemas (developer, capital partner, project, transaction, workflow, etc.)
- Reusable validation rules and utilities

#### **Step-by-Step Validation**

- Validation at each step in stepper components
- Custom validation hooks: `useStepValidation.ts`
- Error display inline with form fields

#### **Usage Example**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
})
```

### **Form Components**

- Form fields with validation
- Multi-step forms
- File uploads
- Date pickers
- Dropdowns and autocompletes

## Internationalization

### **i18n Setup**

- **next-i18next**: i18n framework
- **Translation Files**: `public/locales/{en,es}/common.json`
- **Dynamic Labels**: Labels fetched from API (banking compliance)

### **Label Management**

#### **Label Stores**

Multiple label stores for different entities:

- **Sidebar Labels**: Navigation menu labels
- **Build Partner Labels**: Build partner form labels
- **Capital Partner Labels**: Capital partner form labels
- **Workflow Labels**: Workflow-related labels
- And more...

#### **Label Characteristics**

- **Session-Only**: Labels not persisted (compliance requirement)
- **API-Driven**: Labels fetched from backend API
- **Loading States**: Separate loading states per label type
- **Error Handling**: Error states for failed label fetches

#### **Usage Example**

```typescript
import { useBuildPartnerLabelsWithCache } from '@/hooks/useBuildPartnerLabelsWithCache'

const { labels, isLoading } = useBuildPartnerLabelsWithCache()
const label = getBuildPartnerLabel('fieldName', labels)
```

### **Language Support**

- English (en)
- Spanish (es)
- Extensible for more languages

## Data Flow & Patterns

### **Request Flow**

1. **User Action** → Component
2. **Component** → Custom hook or service
3. **Service** → API client (`apiClient.ts`)
4. **API Client** → Backend API
5. **Response** → Store update (Zustand) or React Query cache
6. **Store Update** → Component re-render

### **Common Patterns**

#### **Custom Hooks**

Business logic encapsulated in hooks (`src/hooks/`):

- `useBuildPartners.ts`: Build partner data fetching
- `useTableState.ts`: Table state management
- `useSidebarConfig.ts`: Sidebar configuration
- Domain-specific hooks for each entity

#### **Service Layer**

API calls abstracted in services:

- One service file per entity
- Centralized API communication
- Type-safe API calls

#### **State Management**

- **Zustand**: Client-side state (UI, user data)
- **React Query**: Server state (API data caching)

#### **Component Patterns**

- Container/Presenter pattern
- Custom hooks for business logic
- Props drilling avoided with context/hooks

## Development Workflow

### **Code Quality Tools**

- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting
- **TypeScript**: Static type checking (strict mode)
- **Pre-commit Hooks**: (Can be added with Husky)

### **Development Scripts**

```bash
npm run dev              # Start development server
npm run lint             # Check code quality
npm run lint:fix         # Fix linting errors
npm run format           # Format code
npm run type-check       # Type check TypeScript
```

### **Code Standards**

- **TypeScript**: Strict mode enabled
- **Naming Conventions**:
  - Components: PascalCase (`DataTable.tsx`)
  - Hooks: camelCase with `use` prefix (`useStepValidation.ts`)
  - Services: camelCase (`authService.ts`)
  - Types: camelCase (`auth.ts`, `permissions.ts`)
- **File Organization**: Co-location of related files
- **Barrel Exports**: Use `index.ts` for clean imports

### **Git Workflow**

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## Configuration

### **Next.js Configuration** (`next.config.js`)

- React Strict Mode enabled
- MUI package transpilation
- Image optimization
- Security headers
- ESLint/TypeScript build errors ignored (for faster builds)

### **TypeScript Configuration** (`tsconfig.json`)

- Strict mode enabled
- Path aliases configured (`@/*` → `src/*`)
- Incremental compilation
- Strict type checking options

### **Tailwind Configuration** (`tailwind.config.js`)

- Custom theme configuration
- Responsive breakpoints
- Custom colors and spacing

### **Environment Variables**

Required environment variables:

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: JWT signing secret
- `ENCRYPTION_KEY`: Encryption key for sensitive data
- `SESSION_SECRET`: Session secret
- `FORCE_HTTPS`: Force HTTPS in production

## Code Conventions

### **File Naming**

- **Components**: PascalCase (`DataTable.tsx`)
- **Hooks**: camelCase with `use` prefix (`useStepValidation.ts`)
- **Services**: camelCase (`authService.ts`)
- **Types**: camelCase (`auth.ts`, `permissions.ts`)
- **Utils**: camelCase (`cookieUtils.ts`)

### **Code Organization**

- **Co-location**: Related files grouped together
- **Index Files**: Barrel exports (`index.ts`)
- **Type Definitions**: Separate `types/` directory
- **Constants**: Centralized in `constants/`

### **TypeScript Patterns**

- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` for `src/*`
- **Type Exports**: Types exported alongside components
- **Interface over Type**: Prefer interfaces for object shapes
- **Explicit Types**: Avoid `any`, use proper types

### **Component Patterns**

- **Functional Components**: Use functional components with hooks
- **TypeScript Props**: Explicit prop interfaces
- **Error Boundaries**: Error handling at component level
- **Lazy Loading**: Load components on demand

## Common Tasks & How-Tos

### **Adding a New Page**

1. Create page file: `src/app/{route}/page.tsx`
2. Add route to sidebar config if needed: `src/constants/sidebarConfig.ts`
3. Add permissions if required
4. Create API service if needed: `src/services/api/{entity}Service.ts`

### **Adding a New API Service**

1. Create service file: `src/services/api/{entity}Service.ts`
2. Add endpoints: `src/constants/apiEndpoints.ts`
3. Use `apiClient` from `src/lib/apiClient.ts`
4. Export from `src/services/api/index.ts`

### **Adding a New Component**

1. Create component in appropriate directory (atoms/molecules/organisms)
2. Add TypeScript types/interfaces
3. Export from `index.ts`
4. Add Storybook story if needed

### **Working with Permissions**

1. Check existing permissions: `src/types/permissions.ts`
2. Use `PermissionAwareDataTable` for tables
3. Use `PermissionButton` for buttons
4. Check permissions in components: `useReactivePermissionCheck`

### **Adding a New Form Field**

1. Use React Hook Form: `useForm` hook
2. Add Zod validation schema
3. Use form components from `molecules/`
4. Handle validation errors

### **Working with Labels**

1. Use label hooks: `useBuildPartnerLabelsWithCache`, etc.
2. Labels are session-only (not persisted)
3. Handle loading and error states
4. Use label mapping utilities

## Contributing

### **Development Setup**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linting and type checking: `npm run lint && npm run type-check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### **Code Standards**

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write clear, readable code
- Update documentation as needed
- Follow security best practices
- Maintain compliance standards

### **Pull Request Guidelines**

- Clear description of changes
- Link to related issues
- Ensure all checks pass
- Request review from team members

## Support

### **Getting Help**

- **Documentation**: Check this README and code comments
- **Code Comments**: Well-documented codebase
- **Type Definitions**: TypeScript types serve as documentation
- **Component Stories**: Storybook for component documentation

### **Common Issues**

#### **Build Errors**

- Check TypeScript errors: `npm run type-check`
- Check ESLint errors: `npm run lint`
- Verify environment variables are set

#### **API Errors**

- Check API endpoint configuration
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check network connectivity
- Review API client error handling

#### **Permission Issues**

- Verify user has required permissions
- Check permission store state
- Review permission configuration

---
