'use client'

import React, { useCallback, useMemo } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Toolbar,
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
import { primaryButtonSx } from '../styles'

interface FormTableColumn {
  name: string
  label: string
  type?: 'text' | 'select' | 'date' | 'number' | 'email'
  options?: { value: string | number; label: string }[]
  required?: boolean
  validation?: any
  width?: string | number
  editable?: boolean
}

interface FormTableProps {
  name: string
  title?: string
  columns: FormTableColumn[]
  minRows?: number
  maxRows?: number
  addButtonText?: string
  emptyMessage?: string
  showActions?: boolean
  sx?: any
}

export const FormTable: React.FC<FormTableProps> = ({
  name,
  title,
  columns,
  minRows = 0,
  maxRows = 50,
  addButtonText = 'Add Row',
  emptyMessage = 'No data available',
  showActions = true,
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
    fields: tableRows,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  })

  const handleAddRow = useCallback(() => {
    if (tableRows.length < maxRows) {
      const newRow = columns.reduce(
        (acc, column) => {
          acc[column.name] = column.type === 'number' ? 0 : ''
          return acc
        },
        {} as Record<string, any>
      )
      append(newRow)
    }
  }, [tableRows.length, maxRows, columns, append])

  const handleRemoveRow = useCallback(
    (index: number) => {
      if (tableRows.length > minRows) {
        remove(index)
      }
    },
    [tableRows.length, minRows, remove]
  )

  const canAdd = tableRows.length < maxRows
  const canRemove = tableRows.length > minRows

  const editableColumns = useMemo(
    () => columns.filter((col) => col.editable !== false),
    [columns]
  )

  return (
    <Box sx={sx}>
      {title && (
        <Toolbar sx={{ px: 0, py: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          <Button
            onClick={handleAddRow}
            disabled={!canAdd}
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            sx={primaryButtonSx}
          >
            {addButtonText}
          </Button>
        </Toolbar>
      )}

      <TableContainer
        component={Paper}
        sx={{ boxShadow: 'none', borderRadius: '8px' }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {editableColumns.map((column) => (
                <TableCell
                  key={column.name}
                  sx={{
                    fontWeight: 600,
                    width: column.width,
                    minWidth: column.width || 120,
                  }}
                >
                  {column.label}
                  {column.required && ' *'}
                </TableCell>
              ))}
              {showActions && (
                <TableCell sx={{ fontWeight: 600, width: 100 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={editableColumns.length + (showActions ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="textSecondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              tableRows.map((row: FieldArrayWithId, rowIndex: number) => (
                <TableRow key={row.id}>
                  {editableColumns.map((column) => (
                    <TableCell key={column.name} sx={{ py: 1 }}>
                      <FormField
                        name={`${name}.${rowIndex}.${column.name}`}
                        control={control}
                        label=""
                        type={column.type || 'text'}
                        options={column.options || []}
                        required={column.required || false}
                        rules={
                          column.validation ||
                          createValidationRules(
                            column.type || 'text',
                            column.required
                          )
                        }
                        error={(errors as any)[name]?.[rowIndex]?.[column.name]}
                        size="small"
                        fullWidth={false}
                      />
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell sx={{ py: 1 }}>
                      <IconButton
                        onClick={() => handleRemoveRow(rowIndex)}
                        disabled={!canRemove}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {tableRows.length > 0 && (
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            onClick={handleAddRow}
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
    </Box>
  )
}
