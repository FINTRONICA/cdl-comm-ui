'use client'

import React, { useState } from 'react'
import { Box, Card, CardContent, Button } from '@mui/material'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { ContactData } from '../developerTypes'
import { RightSlideContactDetailsPanel } from '../../RightSlidePanel/RightSlideContactDetailsPanel'
import { ExpandableDataTable } from '../../ExpandableDataTable'
import { useTableState } from '@/hooks'

// Use ContactData directly from developerTypes

interface Step2Props {
  contactData: ContactData[]
  onFeesChange: (contactData: ContactData[]) => void
  buildPartnerId?: string
  isReadOnly?: boolean
}

const Step2: React.FC<Step2Props> = ({
  contactData,
  onFeesChange,
  buildPartnerId,
  isReadOnly = false,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const contacts = contactData || []

  const addContact = () => {
    setIsPanelOpen(true)
  }

  const handleContactAdded = (newContact: unknown) => {
    const updatedContacts = [...contacts, newContact as ContactData]
    onFeesChange(updatedContacts)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  const tableColumns = [
    {
      key: 'name',
      label: 'Name',
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'address',
      label: 'Address',
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email ID',
      type: 'text' as const,
      width: 'w-40',
      sortable: true,
    },
    {
      key: 'pobox',
      label: 'PO Box',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'countrycode',
      label: 'Country Code',
      type: 'text' as const,
      width: 'w-20',
      sortable: true,
    },
    {
      key: 'mobileno',
      label: 'Mobile No',
      type: 'text' as const,
      width: 'w-26',
      sortable: true,
    },
    {
      key: 'telephoneno',
      label: 'Telephone No',
      type: 'text' as const,
      width: 'w-26',
      sortable: true,
    },
    {
      key: 'fax',
      label: 'FAX',
      type: 'text' as const,
      width: 'w-24',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Action',
      type: 'actions' as const,
      width: 'w-20',
    },
  ]

  const {
    search,
    paginated,
    totalRows,
    totalPages,
    startItem,
    endItem,
    page,
    rowsPerPage,
    selectedRows,
    expandedRows,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRowSelectionChange,
    handleRowExpansionChange,
  } = useTableState({
    data: contacts,
    searchFields: [
      'name',
      'address',
      'email',
      'pobox',
      'countrycode',
      'mobileno',
      'telephoneno',
      'fax',
    ],
    initialRowsPerPage: 20,
  })

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card
        sx={{
          boxShadow: 'none',
          backgroundColor: '#FFFFFFBF',
          width: '94%',
          margin: '0 auto',
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="end" alignItems="center" mb={4}>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={addContact}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              }}
            >
              Add Contact
            </Button>
          </Box>
          <ExpandableDataTable<ContactData>
            data={paginated}
            columns={tableColumns}
            searchState={search}
            onSearchChange={handleSearchChange}
            paginationState={{
              page,
              rowsPerPage,
              totalRows,
              totalPages,
              startItem,
              endItem,
            }}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            selectedRows={selectedRows}
            onRowSelectionChange={handleRowSelectionChange}
            expandedRows={expandedRows}
            onRowExpansionChange={handleRowExpansionChange}
          />
        </CardContent>
      </Card>
      <RightSlideContactDetailsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onContactAdded={handleContactAdded}
        buildPartnerId={buildPartnerId}
      />
    </LocalizationProvider>
  )
}

export default Step2
