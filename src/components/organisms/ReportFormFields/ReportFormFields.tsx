'use client'

import React from 'react'
import { ProjectSelector, ProjectOption } from '@/components/molecules/ProjectSelector'
import { DeveloperSelector, DeveloperOption } from '@/components/molecules/DeveloperSelector'

interface ReportField {
  id: string
  label: string
  type: 'select' | 'date' | 'text' | 'multiselect'
  required: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface ReportFormFieldsProps {
  fields: ReportField[]
  values: Record<string, string | string[]>
  onChange: (fieldId: string, value: string | string[]) => void
}

export const ReportFormFields: React.FC<ReportFormFieldsProps> = ({
  fields,
  values,
  onChange,
}) => {
  const renderField = (field: ReportField) => {
    const value = values[field.id] || ''

    switch (field.type) {
      case 'select':
        // Use ProjectSelector for project fields
        if (field.id === 'projectId') {
          const projectOptions: ProjectOption[] = field.options?.map(option => {
            const originalId = option.value.includes('-') ? option.value.split('-')[0] : option.value
            return {
              value: option.value,
              label: option.label,
              ...(originalId && originalId !== option.value ? { originalId } : {})
            }
          }) || []

          return (
            <div key={field.id} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <ProjectSelector
                value={value as string}
                onChange={(selectedValue) => onChange(field.id, selectedValue)}
                options={projectOptions}
                placeholder={field.placeholder || 'Search and select project...'}
                required={field.required}
                className="text-sm"
              />
            </div>
          )
        }

        // Use DeveloperSelector for developer fields
        if (field.id === 'developerId') {
          const developerOptions: DeveloperOption[] = field.options?.map(option => ({
            value: option.value,
            label: option.label,
            ...(option.value !== option.label ? { originalId: option.value } : {})
          })) || []

          return (
            <div key={field.id} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <DeveloperSelector
                value={value as string}
                onChange={(selectedValue) => onChange(field.id, selectedValue)}
                options={developerOptions}
                placeholder={field.placeholder || 'Search and select developer...'}
                required={field.required}
                className="text-sm"
              />
            </div>
          )
        }

        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                value={value as string}
                onChange={(e) => onChange(field.id, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-colors duration-200 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  {field.placeholder || 'Select an option'}
                </option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )

      case 'date':
        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value as string}
              onChange={(e) => onChange(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-colors duration-200"
            />
          </div>
        )

      case 'text':
        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value as string}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder || 'Enter text'}
              required={field.required}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-colors duration-200"
            />
          </div>
        )

      case 'multiselect':
        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                multiple
                value={value as string[]}
                onChange={(e) => {
                  const selectedValues = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  )
                  onChange(field.id, selectedValues)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-colors duration-200"
                required={field.required}
                size={Math.min(field.options?.length || 3, 5)}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Hold Ctrl/Cmd to select multiple options
            </p>
          </div>
        )

      default:
        return null
    }
  }

  if (!fields.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <p className="text-sm font-medium mb-1">No form fields configured</p>
        <p className="text-xs">This report does not require any input parameters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {fields.map(renderField)}
    </div>
  )
}
