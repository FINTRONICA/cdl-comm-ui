'use client'

import React, { useCallback } from 'react'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Card,
  CardContent,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  useFieldArray,
  useFormContext,
  FieldArrayWithId,
} from 'react-hook-form'
import { FormField } from './FormField'
import { createValidationRules } from './FormField'
import { cardStyles, primaryButtonSx } from '../styles'

interface FormArrayProps {
  name: string
  title?: string
  subtitle?: string
  fields: Array<{
    name: string
    label: string
    type?: 'text' | 'select' | 'date' | 'number' | 'email'
    options?: { value: string | number; label: string }[]
    required?: boolean
    validation?: any
    gridSize?: { xs?: number; md?: number }
  }>
  minItems?: number
  maxItems?: number
  addButtonText?: string
  removeButtonText?: string
  emptyMessage?: string
  sx?: any
}

export const FormArray: React.FC<FormArrayProps> = ({
  name,
  title,
  subtitle,
  fields,
  minItems = 0,
  maxItems = 10,
  addButtonText = 'Add Item',
  removeButtonText = 'Remove', // eslint-disable-line @typescript-eslint/no-unused-vars
  emptyMessage = 'No items added yet',
  sx,
}) => {
  const formContext = useFormContext()

  // Early return if form context is not available
  if (!formContext) {
    return (
      <Box sx={sx}>
        <Typography color="error" align="center">
          Form context not available. Please ensure FormProvider is properly set
          up.
        </Typography>
      </Box>
    )
  }

  const {
    control,
    formState: { errors },
  } = formContext

  const {
    fields: fieldArray,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  })

  const handleAdd = useCallback(() => {
    if (fieldArray.length < maxItems) {
      const newItem = fields.reduce(
        (acc, field) => {
          acc[field.name] = field.type === 'number' ? 0 : ''
          return acc
        },
        {} as Record<string, any>
      )
      append(newItem)
    }
  }, [fieldArray.length, maxItems, fields, append])

  const handleRemove = useCallback(
    (index: number) => {
      if (fieldArray.length > minItems) {
        remove(index)
      }
    },
    [fieldArray.length, minItems, remove]
  )

  const canAdd = fieldArray.length < maxItems
  const canRemove = fieldArray.length > minItems

  return (
    <Box sx={sx}>
      {title && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Button
            onClick={handleAdd}
            disabled={!canAdd}
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            sx={primaryButtonSx}
          >
            {addButtonText}
          </Button>
        </Box>
      )}

      {subtitle && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}

      {fieldArray.length === 0 ? (
        <Card sx={cardStyles}>
          <CardContent>
            <Typography color="textSecondary" align="center">
              {emptyMessage}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {fieldArray.map((item: FieldArrayWithId, index: number) => (
            <Card key={item.id} sx={{ ...cardStyles, mb: 2 }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Item {index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => handleRemove(index)}
                    disabled={!canRemove}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={2}>
                  {fields.map((field) => (
                    <Box key={field.name} flex={1} minWidth={200}>
                      <FormField
                        name={`${name}.${index}.${field.name}`}
                        control={control}
                        label={field.label}
                        type={field.type || 'text'}
                        options={field.options || []}
                        required={field.required || false}
                        rules={
                          field.validation ||
                          createValidationRules(
                            field.type || 'text',
                            field.required
                          )
                        }
                        error={(errors as any)[name]?.[index]?.[field.name]}
                        size="small"
                        {...(field.gridSize && { gridSize: field.gridSize })}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {fieldArray.length > 0 && (
        <Box mt={2}>
          <Button
            onClick={handleAdd}
            disabled={!canAdd}
            startIcon={<AddIcon />}
            variant="outlined"
            sx={primaryButtonSx}
          >
            {addButtonText}
          </Button>
        </Box>
      )}
    </Box>
  )
}
