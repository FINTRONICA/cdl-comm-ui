# Workflow Management System - Complete Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Pages and Components](#pages-and-components)
- [API Services](#api-services)
- [React Query Hooks](#react-query-hooks)
- [Form Management](#form-management)
- [State Management](#state-management)
- [File Structure](#file-structure)
- [Usage Examples](#usage-examples)
- [Development Guide](#development-guide)

## Overview

The Workflow Management System is a comprehensive solution for managing business workflows in the Escrow Bank application. It provides a complete CRUD interface for managing workflow definitions, actions, stage templates, amount rules, and amount stage overrides.

### Key Features
- **Workflow Definitions**: Core workflow configurations with application modules and actions
- **Workflow Actions**: Reusable actions that can be used across workflows
- **Stage Templates**: Template definitions for workflow stages
- **Amount Rules**: Rules that govern amount-based workflow processing
- **Amount Stage Overrides**: Stage-specific overrides for amount rules
- **Multi-language Support**: Dynamic label management with caching
- **Real-time Updates**: React Query integration for optimistic updates
- **Form Validation**: Comprehensive form handling with React Hook Form

## Architecture

### System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Pages       │    │   Components    │    │   Services      │
│                 │    │                 │    │                 │
│ • Definition    │◄──►│ • Data Tables   │◄──►│ • API Services  │
│ • Action        │    │ • Side Panels   │    │ • Label Services│
│ • Stage Template│    │ • Forms         │    │ • Mapping Utils │
│ • Amount Rule   │    │                 │    │                 │
│ • Stage Override│    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────▼─────────────────────────────────┐
│                     State Management                              │
│                                                                   │
│ • React Query (Server State)                                     │
│ • Zustand Store (Client State)                                   │
│ • React Hook Form (Form State)                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend Framework**: Next.js 14 with App Router
- **State Management**: React Query + Zustand
- **Form Management**: React Hook Form
- **UI Components**: Material-UI (MUI)
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript

## Pages and Components

### 1. Workflow Definition Page
**Location**: `src/app/admin/workflow/definition/page.tsx`

**Purpose**: Manage workflow definitions that define the overall structure and behavior of workflows.

**Key Features**:
- Create, read, update, delete workflow definitions
- Link with application modules and workflow actions
- Version management
- Amount-based workflow configuration
- Expandable data table with search and pagination

**Navigation**: `/admin/workflow/definition`

### 2. Workflow Action Page
**Location**: `src/app/admin/workflow/action/page.tsx`

**Purpose**: Manage reusable workflow actions that can be used across different workflows.

**Key Features**:
- CRUD operations for workflow actions
- Module code association
- Action key and name management
- Client-side search and filtering

**Navigation**: `/admin/workflow/action`

### 3. Stage Template Page
**Location**: `src/app/admin/workflow/stage-template/page.tsx`

**Purpose**: Define reusable stage templates for workflow stages.

**Key Features**:
- Stage order management
- Keycloak group integration
- Required approvals configuration
- SLA hours tracking
- Workflow definition association

**Navigation**: `/admin/workflow/stage-template`

### 4. Amount Rule Page
**Location**: `src/app/admin/workflow/amount-rule/page.tsx`

**Purpose**: Configure rules for amount-based workflow processing.

**Key Features**:
- Currency-specific rules
- Min/max amount thresholds
- Priority-based rule ordering
- Required makers and checkers configuration
- Workflow definition linking

**Navigation**: `/admin/workflow/amount-rule`

### 5. Amount Stage Override Page
**Location**: `src/app/admin/workflow/amount-stage-override/page.tsx`

**Purpose**: Define stage-specific overrides for amount processing rules.

**Key Features**:
- Stage order customization
- Required approvals override
- Keycloak group assignment
- Stage key management
- Amount rule association

**Navigation**: `/admin/workflow/amount-stage-override`

## API Services

### Service Architecture
All workflow services follow a consistent pattern with the following structure:

```typescript
export class WorkflowService {
  // CRUD Operations
  async getItems(page, size, filters): Promise<PaginatedResponse<T>>
  async getItem(id): Promise<T>
  async createItem(data): Promise<T>
  async updateItem(id, updates): Promise<T>
  async deleteItem(id): Promise<void>
  
  // Label Management
  async getLabels(): Promise<LabelResponse[]>
  
  // Mapping Utilities
  transformToUIData(apiResponse): PaginatedResponse<UIData>
  mapToUIData(apiData): UIData
}
```

### 1. Workflow Definition Service
**Location**: `src/services/api/workflowDefinitionService.ts`

**Key Methods**:
- `getWorkflowDefinitions(page, size, filters)`: Fetch paginated definitions
- `createWorkflowDefinition(data)`: Create new definition
- `updateWorkflowDefinition(id, updates)`: Update existing definition
- `deleteWorkflowDefinition(id)`: Delete definition
- `getWorkflowDefinitionApplicationModules()`: Get related application modules
- `getWorkflowDefinitionActions()`: Get available actions

**Types**:
- `WorkflowDefinition`: Core API response type
- `WorkflowDefinitionUIData`: UI-friendly data structure
- `CreateWorkflowDefinitionRequest`: Creation payload
- `UpdateWorkflowDefinitionRequest`: Update payload

### 2. Workflow Action Service
**Location**: `src/services/api/workflowActionService.ts`

**Key Methods**:
- `getWorkflowActions(page, size, filters)`: Fetch paginated actions
- `searchWorkflowActions(query, page, size)`: Search actions
- `createWorkflowAction(data)`: Create new action
- `updateWorkflowAction(id, updates)`: Update action
- `deleteWorkflowAction(id)`: Delete action

### 3. Workflow Stage Template Service
**Location**: `src/services/api/workflowStageTemplateService.ts`

**Key Features**:
- Stage template CRUD operations
- Workflow definition association
- SLA and approval management

### 4. Workflow Amount Rule Service
**Location**: `src/services/api/workflowAmountRuleService.ts`

**Key Features**:
- Amount-based rule configuration
- Currency and threshold management
- Priority and approval workflow setup

### 5. Workflow Amount Stage Override Service
**Location**: `src/services/api/workflowAmountStageOverrideService.ts`

**Key Features**:
- Stage-specific overrides
- Amount rule association
- Keycloak integration

## React Query Hooks

### Hook Architecture
Each workflow entity has a comprehensive set of React Query hooks following this pattern:

```typescript
// Data Fetching
export function useWorkflowItems(page, size, filters)
export function useWorkflowItem(id)
export function useSearchWorkflowItems(query)

// Mutations
export function useCreateWorkflowItem()
export function useUpdateWorkflowItem()
export function useDeleteWorkflowItem()

// Labels
export function useWorkflowItemLabels()
export function useWorkflowItemLabelsWithCache()

// Utilities
export function useWorkflowItemForm()
export function useWorkflowItemManager()
```

### 1. Workflow Definition Hooks
**Location**: `src/hooks/useWorkflowDefinitions.ts`

**Key Hooks**:
- `useWorkflowDefinitions(page, size, filters)`: Paginated data fetching
- `useFindAllWorkflowDefinitions()`: Non-paginated fetching
- `useWorkflowDefinition(id)`: Single definition
- `useCreateWorkflowDefinition()`: Creation mutation
- `useUpdateWorkflowDefinition()`: Update mutation
- `useDeleteWorkflowDefinition()`: Delete mutation
- `useWorkflowDefinitionForm()`: Comprehensive form management
- `useApplicationModules()`: Related application modules
- `useWorkflowActions()`: Available workflow actions

### 2. Workflow Action Hooks
**Location**: `src/hooks/useWorkflowActions.ts`

**Key Features**:
- Complete CRUD operations
- Search functionality
- Label management with caching
- Optimistic updates
- Error handling and retry logic

### 3. Label Management Hooks
Each workflow entity has dedicated label hooks:
- `useWorkflowDefinitionLabelsWithCache.ts`
- `useWorkflowActionLabelsWithCache.ts`
- `useWorkflowAmountRuleLabelsWithCache.ts`
- `useWorkflowAmountStageOverrideLabelsWithCache.ts`

**Features**:
- Multi-language support
- Caching with React Query
- Fallback to static labels
- Dynamic label resolution

## Form Management

### Form Architecture
All workflow forms use React Hook Form with Material-UI components and follow this pattern:

```typescript
interface FormData {
  // Form field definitions
}

const DEFAULT_VALUES: FormData = {
  // Default values
}

export const WorkflowFormPanel: React.FC<Props> = ({
  isOpen, onClose, mode, data
}) => {
  const { control, handleSubmit, reset, formState } = useForm<FormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange'
  })
  
  // Form submission logic
  const onSubmit = (formData: FormData) => {
    // Handle create/update
  }
  
  return (
    <Drawer>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Drawer>
  )
}
```

### 1. Workflow Definition Form
**Location**: `src/components/organisms/RightSlidePanel/RightSlideWorkflowDefinitionPanel.tsx`

**Form Fields**:
- `name`: Workflow definition name
- `version`: Version number
- `amountBased`: Boolean flag for amount-based processing
- `moduleCode`: Associated module code
- `actionCode`: Associated action code
- `applicationModuleId`: Linked application module
- `workflowActionId`: Linked workflow action
- `active`: Active status

### 2. Workflow Action Form
**Location**: `src/components/organisms/RightSlidePanel/RightSlideWorkflowActionPanel.tsx`

**Form Fields**:
- `actionKey`: Unique action identifier
- `actionName`: Display name for the action
- `moduleCode`: Associated module code
- `description`: Action description
- `name`: Internal name

### 3. Stage Template Form
**Location**: `src/components/organisms/RightSlidePanel/RightSlideWorkflowStageTemplatePanel.tsx`

**Form Fields**:
- `stageOrder`: Stage sequence number
- `stageKey`: Unique stage identifier
- `keycloakGroup`: Associated Keycloak group
- `requiredApprovals`: Number of required approvals
- `name`: Stage template name
- `description`: Stage description
- `slaHours`: SLA time in hours
- `workflowDefinitionDTO`: Associated workflow definition

### 4. Amount Rule Form
**Location**: `src/components/organisms/RightSlidePanel/RightSlideWorkflowAmountRulePanel.tsx`

**Form Fields**:
- `currency`: Rule currency
- `minAmount`: Minimum amount threshold
- `maxAmount`: Maximum amount threshold
- `priority`: Rule priority
- `requiredMakers`: Number of required makers
- `requiredCheckers`: Number of required checkers
- `workflowId`: Associated workflow definition

### 5. Amount Stage Override Form
**Location**: `src/components/organisms/RightSlidePanel/RightSlideWorkflowAmountStageOverridePanel.tsx`

**Form Fields**:
- `stageOrder`: Override stage order
- `requiredApprovals`: Override approval count
- `keycloakGroup`: Override Keycloak group
- `stageKey`: Override stage key
- `workflowAmountRuleId`: Associated amount rule

## State Management

### Global State (Zustand Store)
**Location**: `src/store/index.ts`

The application uses Zustand for global state management with the following slices:

```typescript
export type AppStore = UserSlice & ProjectSlice & TransactionSlice & UISlice & LabelsSlice
```

### Labels State Management
**Location**: `src/store/slices/labelsSlice.ts`

Manages multi-language labels for all workflow entities:

```typescript
export interface LabelsState {
  // Workflow-specific label states
  workflowActionLabels: ProcessedLabels | null
  workflowDefinitionLabels: ProcessedLabels | null
  workflowStageTemplateLabels: ProcessedLabels | null
  workflowAmountRuleLabels: ProcessedLabels | null
  workflowAmountStageOverrideLabels: ProcessedLabels | null
  
  // Loading and error states for each
  // ...
}
```

### Server State (React Query)
React Query manages all server-side state with:
- **Caching**: 5-minute stale time for data queries
- **Background Updates**: Automatic refetching on window focus
- **Optimistic Updates**: Immediate UI updates with rollback capability
- **Error Handling**: Retry logic and error boundaries
- **Invalidation**: Smart cache invalidation on mutations

### Form State (React Hook Form)
Each form manages its own state with:
- **Validation**: Real-time field validation
- **Dirty State Tracking**: Track form changes
- **Error Handling**: Field-level error messages
- **Reset Capability**: Form reset on mode changes
- **Controlled Components**: Integration with Material-UI

## File Structure

```
src/
├── app/admin/workflow/              # Workflow pages
│   ├── definition/page.tsx          # Workflow definitions
│   ├── action/page.tsx              # Workflow actions
│   ├── stage-template/page.tsx      # Stage templates
│   ├── amount-rule/page.tsx         # Amount rules
│   ├── amount-stage-override/page.tsx # Amount stage overrides
│   └── README.md                    # Basic workflow documentation
│
├── components/organisms/RightSlidePanel/  # Form components
│   ├── RightSlideWorkflowDefinitionPanel.tsx
│   ├── RightSlideWorkflowActionPanel.tsx
│   ├── RightSlideWorkflowStageTemplatePanel.tsx
│   ├── RightSlideWorkflowAmountRulePanel.tsx
│   └── RightSlideWorkflowAmountStageOverridePanel.tsx
│
├── hooks/                           # React Query hooks
│   ├── useWorkflowDefinitions.ts
│   ├── useWorkflowActions.ts
│   ├── useWorkflowStageTemplates.ts
│   ├── useWorkflowAmountRules.ts
│   ├── useWorkflowAmountStageOverrides.ts
│   └── *LabelsWithCache.ts          # Label management hooks
│
├── services/api/                    # API services
│   ├── workflowDefinitionService.ts
│   ├── workflowActionService.ts
│   ├── workflowStageTemplateService.ts
│   ├── workflowAmountRuleService.ts
│   ├── workflowAmountStageOverrideService.ts
│   └── *LabelsService.ts           # Label services
│
├── store/                          # State management
│   ├── index.ts                    # Main store configuration
│   └── slices/
│       └── labelsSlice.ts          # Labels state management
│
├── constants/
│   ├── apiEndpoints.ts             # API endpoint definitions
│   ├── sidebarConfig.ts            # Navigation configuration
│   └── mappings/
│       └── workflowMapping.ts      # Label mappings
│
└── types/                          # TypeScript definitions
    └── index.ts
```

## Usage Examples

### 1. Creating a New Workflow Definition

```typescript
import { useWorkflowDefinitionForm } from '@/hooks/useWorkflowDefinitions'

function CreateWorkflowDefinition() {
  const { 
    createDefinition, 
    moduleOptions, 
    actionOptions, 
    isSubmitting 
  } = useWorkflowDefinitionForm()
  
  const handleCreate = async (formData) => {
    try {
      await createDefinition({
        name: formData.name,
        version: 1,
        amountBased: formData.amountBased,
        applicationModuleId: formData.applicationModuleId,
        workflowActionId: formData.workflowActionId,
        active: true
      })
      // Handle success
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <form onSubmit={handleSubmit(handleCreate)}>
      {/* Form fields */}
    </form>
  )
}
```

### 2. Fetching Workflow Data with Filters

```typescript
import { useWorkflowDefinitions } from '@/hooks/useWorkflowDefinitions'

function WorkflowList() {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useWorkflowDefinitions(0, 20, {
    name: 'Payment',
    active: true
  })
  
  if (isLoading) return <Loading />
  if (error) return <Error error={error} onRetry={refetch} />
  
  return (
    <div>
      {data?.content.map(definition => (
        <div key={definition.id}>
          {definition.name} - v{definition.version}
        </div>
      ))}
    </div>
  )
}
```

### 3. Using Labels with Multi-language Support

```typescript
import { useWorkflowDefinitionLabelsWithCache } from '@/hooks/useWorkflowDefinitionLabelsWithCache'
import { useAppStore } from '@/store'

function WorkflowDefinitionTable() {
  const currentLanguage = useAppStore(s => s.language)
  const { data: labels, getLabel } = useWorkflowDefinitionLabelsWithCache()
  
  const getWorkflowLabel = useCallback((configId: string) => {
    return getLabel(
      configId,
      currentLanguage,
      'Default Label' // fallback
    )
  }, [getLabel, currentLanguage])
  
  return (
    <table>
      <thead>
        <tr>
          <th>{getWorkflowLabel('CDL_WD_NAME')}</th>
          <th>{getWorkflowLabel('CDL_WD_VERSION')}</th>
          <th>{getWorkflowLabel('CDL_WD_STATUS')}</th>
        </tr>
      </thead>
      {/* Table body */}
    </table>
  )
}
```

### 4. Managing Complex Forms

```typescript
import { useForm, Controller } from 'react-hook-form'
import { useWorkflowDefinitionForm } from '@/hooks/useWorkflowDefinitions'

interface WorkflowFormData {
  name: string
  amountBased: boolean
  applicationModuleId: number | null
}

function WorkflowForm({ mode, data, onClose }) {
  const { 
    createDefinition, 
    updateDefinition, 
    moduleOptions 
  } = useWorkflowDefinitionForm()
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { isDirty, isSubmitting } 
  } = useForm<WorkflowFormData>({
    defaultValues: {
      name: data?.name || '',
      amountBased: data?.amountBased || false,
      applicationModuleId: data?.applicationModuleId || null
    }
  })
  
  const onSubmit = async (formData: WorkflowFormData) => {
    try {
      if (mode === 'edit') {
        await updateDefinition(data.id, formData)
      } else {
        await createDefinition(formData)
      }
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Name is required' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Workflow Name"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      
      <Controller
        name="applicationModuleId"
        control={control}
        render={({ field }) => (
          <FormControl>
            <InputLabel>Application Module</InputLabel>
            <Select {...field}>
              {moduleOptions.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
      
      <Button 
        type="submit" 
        disabled={!isDirty || isSubmitting}
      >
        {mode === 'edit' ? 'Update' : 'Create'}
      </Button>
    </form>
  )
}
```

## Development Guide

### Adding a New Workflow Entity

1. **Create API Service**:
   ```typescript
   // src/services/api/newWorkflowService.ts
   export class NewWorkflowService {
     async getItems(page, size, filters) { /* implementation */ }
     async createItem(data) { /* implementation */ }
     async updateItem(id, updates) { /* implementation */ }
     async deleteItem(id) { /* implementation */ }
   }
   ```

2. **Create React Query Hooks**:
   ```typescript
   // src/hooks/useNewWorkflow.ts
   export function useNewWorkflowItems() { /* implementation */ }
   export function useCreateNewWorkflow() { /* implementation */ }
   export function useUpdateNewWorkflow() { /* implementation */ }
   export function useDeleteNewWorkflow() { /* implementation */ }
   ```

3. **Create Page Component**:
   ```typescript
   // src/app/admin/workflow/new-entity/page.tsx
   export default function NewWorkflowPage() {
     // Page implementation with data table
   }
   ```

4. **Create Form Panel**:
   ```typescript
   // src/components/organisms/RightSlidePanel/RightSlideNewWorkflowPanel.tsx
   export const RightSlideNewWorkflowPanel = () => {
     // Form implementation
   }
   ```

5. **Add Navigation**:
   ```typescript
   // src/constants/sidebarConfig.ts
   {
     id: 'new-workflow-entity',
     label: 'New Entity',
     href: '/admin/workflow/new-entity',
     icon: SomeIcon
   }
   ```

### Best Practices

1. **Error Handling**:
   - Always provide error boundaries
   - Show user-friendly error messages
   - Implement retry mechanisms for failed requests

2. **Performance**:
   - Use React Query caching effectively
   - Implement optimistic updates for better UX
   - Lazy load components where appropriate

3. **Type Safety**:
   - Define comprehensive TypeScript interfaces
   - Use strict typing for all API responses
   - Implement proper form validation

4. **Accessibility**:
   - Use semantic HTML elements
   - Provide proper ARIA labels
   - Ensure keyboard navigation works

5. **Testing**:
   - Write unit tests for services
   - Test React Query hooks
   - Implement integration tests for forms

### Common Patterns

1. **Service Layer Pattern**:
   ```typescript
   export class WorkflowService {
     private baseUrl = '/api/workflow'
     
     async getItems() {
       return apiClient.get(`${this.baseUrl}/items`)
     }
   }
   ```

2. **Hook Composition Pattern**:
   ```typescript
   export function useWorkflowManager() {
     const create = useCreateWorkflow()
     const update = useUpdateWorkflow()
     const delete = useDeleteWorkflow()
     
     return { create, update, delete }
   }
   ```

3. **Form State Pattern**:
   ```typescript
   const { control, handleSubmit, formState } = useForm({
     defaultValues: DEFAULT_VALUES,
     mode: 'onChange'
   })
   ```

### Troubleshooting

1. **React Query Issues**:
   - Check query keys for uniqueness
   - Verify cache invalidation logic
   - Ensure proper error handling

2. **Form Issues**:
   - Verify form validation rules
   - Check default values setup
   - Ensure proper field registration

3. **API Issues**:
   - Check endpoint configurations
   - Verify request/response mappings
   - Test authentication headers

4. **State Management Issues**:
   - Check Zustand store configuration
   - Verify label loading logic
   - Test store persistence settings

---

## Conclusion

This workflow management system provides a robust, scalable solution for managing complex business workflows. The architecture emphasizes:

- **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
- **Type Safety**: Comprehensive TypeScript coverage
- **Performance**: Optimized data fetching and caching
- **User Experience**: Responsive UI with real-time updates
- **Maintainability**: Consistent patterns and clear documentation

For questions or contributions, please refer to the development team or create an issue in the project repository.
