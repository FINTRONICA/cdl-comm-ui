import React, { useRef, useState } from 'react';
import {
  Box, Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, Grid, IconButton, InputLabel, Menu, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  MoreVert
} from '@mui/icons-material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Controller, useFormContext } from 'react-hook-form';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { RightSlideDocumentsPanel } from '@/components/organisms/RightSlidePanel/RightSlideDocumentPanel';

type DocumentItem = {
  name: string;
  date: string;
  type: string;
};

export const GuaranteeForm = () => {
  const { control } = useFormContext();
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    // setSelectedReport(null)
  }

  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentItem[]>([]); // Add state for uploaded documents
  // State for the menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);

  const handleFileData = (data: []) => {

    data.map((file: any) => { setUploadedDocuments((prev) => [...prev, { name: file.name, date: new Date().toLocaleDateString(), type: file.type }]); });
    // setUploadedDocuments(data);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    console.log(file)
    if (file) {
      const newDocument = {
        name: file.name,
        date: new Date(file.lastModified).toLocaleDateString(), // Format the lastModified date
        type: file.type,
      };
      setUploadedDocuments((prev) => [...prev, newDocument]); // Update the state with the new document
    }
  };

  // Menu handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, document: DocumentItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleView = () => {
    // Implement view action
    console.log("View document:", selectedDocument);
    handleCloseMenu();
  };

  const handleDelete = () => {
    // Implement delete action
    console.log("Delete document:", selectedDocument);
    setUploadedDocuments((prev) => prev.filter(doc => doc !== selectedDocument));
    handleCloseMenu();
  };

  // Common styles for form components
  const commonFieldStyles = {
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#CAD5E2',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#CAD5E2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },
  }


  const selectStyles = {
    height: '46px',
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#CAD5E2',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#CAD5E2',
      },
      '&.MuiFormControlLabel': {
        borderColor: '#CAD5E2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },

    '& .MuiSelect-icon': {
      color: '#666',
    },
  }

  const datePickerStyles = {
    height: '46px',
    '& .MuiOutlinedInput-root': {
      height: '46px',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#CAD5E2',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#CAD5E2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2563EB',
      },
    },
  }

  const labelSx = {
    color: '#6A7282',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    letterSpacing: 0,
  };

  const valueSx = {
    color: '#1E2939',
    fontFamily: 'Outfit',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '14px',
    letterSpacing: 0,
    wordBreak: 'break-word',
  };

  const StyledCalendarIcon = (props: any) => (
    <CalendarTodayOutlinedIcon
      {...props}
      sx={{
        width: '18px',
        height: '20px',
        position: 'relative',
        padding: '1px',
        transform: 'rotate(0deg)',
        opacity: 1,
      }}
    />
  )

  const renderTextField = (name: string, label: string, defaultValue = '', gridSize: number = 6) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            fullWidth
            InputLabelProps={{ sx: labelSx }}
            InputProps={{ sx: valueSx }}
            sx={commonFieldStyles}
          />
        )}
      />
    </Grid>
  );

  const renderSelectField = (name: string, label: string, options: string[], gridSize: number = 6) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        rules={{ required: `${label} is required` }}
        defaultValue={''}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel sx={labelSx}>{label}</InputLabel>
            <Select
              {...field}
              label={label}

              sx={{
                ...selectStyles,
                ...valueSx,
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid #9ca3af",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "2px solid #2563eb",
                },
              }}
              IconComponent={KeyboardArrowDownIcon}
            >
              <MenuItem value="" disabled>-- Select --</MenuItem>
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </Grid>
  );

  const renderCheckboxField = (
    name: string,
    label?: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize, }}>
      <div className='text-sm'>{label}</div>
      <Controller
        name={name}
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={!!field.value}
                sx={{
                  color: '#CAD5E2',
                  '&.Mui-checked': {
                    color: '#2563EB',
                  },
                }}
              />
            }
            label="Yes"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontFamily: 'Outfit, sans-serif',
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.5px',
                verticalAlign: 'middle',
              },
            }}
          />
        )}
      />
    </Grid>
  );

  const renderDatePickerField = (
    name: string,
    label: string,
    gridSize: number = 6
  ) => (
    <Grid key={name} size={{ xs: 12, md: gridSize }}>
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field }) => (
          <DatePicker
            label={label}
            value={field.value}
            onChange={field.onChange}
            format="DD/MM/YYYY"
            slots={{
              openPickerIcon: StyledCalendarIcon,
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                // error: !!errors[name],


                sx: datePickerStyles,
                InputLabelProps: { sx: labelSx },
                InputProps: {
                  sx: valueSx,
                  style: { height: '46px' },
                },
              },
            }}
          />
        )}
      />
    </Grid>
  )


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ boxShadow: 'none', backgroundColor: '#FFFFFFBF', width: '84%', margin: '0 auto' }}>
        <CardContent>
          <Grid container rowSpacing={4} columnSpacing={2}>
            {renderTextField('guaranteeRefNo', 'Guarantee Reference Number*')}
            {renderSelectField('guaranteeType', 'Guarantee Type*', ['Performance Guarantee', 'Financial Guarantee', 'Advance Payment Guarantee', 'Bid Bond', 'Retention Money Guarantee', 'Customs Guarantee',])}
            {renderDatePickerField('guaranteeDate', 'Guarantee Date*')}
            {renderTextField('projectCif', 'Project CIF*')}
            {renderSelectField('projectName', 'Project Name*', ['Ajman Heights', 'Dubai Creek Towers', 'Marina Bay Residency', 'Palm View Villas', 'Sharjah Central Mall',])}
            {renderTextField('develperName', 'Developer/Contractor Name*')}
            {renderCheckboxField('openEndedGuarantee', 'Open Ended Guarantee', 3)}
            {renderDatePickerField('projectCompletionDate', 'Project completion date', 3)}
            {renderTextField('noOfAmmendments', 'No of Ammendments', '', 3)}
            {renderDatePickerField('guaranteeExpirationDate', 'Guarantee Expiration Date*', 3)}
            {renderTextField('guaranteeAmount', 'Guarantee Amount*', '', 4)}
            {renderTextField('newReading', 'New Reading (Amendments)', '', 4)}
            {renderSelectField('issuerBank', 'Issuer Bank*', ['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Bank of Baroda', 'HSBC',], 4)}

            <div className='pl-216'></div>

            {renderSelectField('status', 'Status*', ['Active', 'Expired', 'Amended', 'Cancelled', 'Pending Approval',], 4)}

          </Grid>

          <Box mt={6}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6" sx={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '18px',
                lineHeight: '28px',        // Assuming "Title Large" line height
                letterSpacing: '0.15px',   // Conservative tracking
                verticalAlign: 'middle',
              }}>
                Supported Documents
              </Typography>
              <Button
                variant="outlined"
                startIcon={<FileUploadOutlinedIcon />}
                onClick={() => { setIsPanelOpen(true) }}
                sx={{
                  textTransform: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,         // Medium
                  fontStyle: 'normal',
                  fontSize: '14px',        // text-sm
                  lineHeight: '20px',      // from design token for text-sm
                  letterSpacing: '0px',

                }}
              >
                Upload Documents
              </Button>
            </Box>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontFamily: 'Outfit', fontWeight: 'normal', }}>Document Name</TableCell>
                    <TableCell colSpan={2} sx={{ fontFamily: 'Outfit', fontWeight: 'normal', }}>Uploaded Date</TableCell>
                    <TableCell colSpan={2} sx={{ fontFamily: 'Outfit', fontWeight: 'normal', }}>Document Type</TableCell>
                    <TableCell colSpan={2} sx={{ fontFamily: 'Outfit', fontWeight: 'normal', }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadedDocuments.length > 0 ? (
                    uploadedDocuments.map((doc, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={2} sx={{ fontFamily: 'Outfit', fontWeight: 'normal', maxWidth: 200 }}>{doc.name}</TableCell>
                        <TableCell colSpan={2} sx={{ fontFamily: 'Outfit', fontWeight: 'normal', }}>{doc.date}</TableCell>
                        <TableCell colSpan={2} sx={{ fontFamily: 'Outfit', fontWeight: 'normal', }}>{doc.type}</TableCell>
                        <TableCell colSpan={2} sx={{ fontFamily: 'Outfit', fontWeight: 'normal', }}>
                          <IconButton onClick={(event) => handleMenuClick(event, doc)} sx={{
                            backgroundColor: '#DBEAFE', // light blue background
                            borderRadius: '8px',       // rounded corners
                            width: 30,
                            height: 30,
                            padding: 1,
                            '&:hover': {
                              backgroundColor: '#d0e2fd' // slightly darker on hover
                            }
                          }}>
                            <MoreVert sx={{ color: '#155DFC' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'Outfit', fontWeight: 'normal', }} colSpan={8} align="center">
                        No documents uploaded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Menu for actions */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleView}>View</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>

        </CardContent>
      </Card>

      <RightSlideDocumentsPanel isOpen={isPanelOpen} onClose={handleClosePanel} sendFileData={handleFileData} />
    </LocalizationProvider>
  );
};