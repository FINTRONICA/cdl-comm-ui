'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Box
} from '@mui/material'
import { 
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material'

const HelpPage = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard'])

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(section => section !== panel)
    )
  }



  const faqSections = [
    {
      id: 'dashboard-faq',
      title: 'Dashboard',
      faqs: [
        {
          id: 'q1',
          question: 'What is shown on the dashboard?',
          answer: 'Snapshot of deposits, payments, guarantees, units, and charges.'
        },
        {
          id: 'q2',
          question: 'Can I filter by developer?',
          answer: 'Yes, using Developer ID or Name.'
        },
        {
          id: 'q3',
          question: 'Can I filter by project?',
          answer: 'Yes, project-level filtering is supported.'
        },
        {
          id: 'q4',
          question: 'Can I filter by date?',
          answer: 'Yes, select a custom range.'
        },
        {
          id: 'q5',
          question: 'What charts are available?',
          answer: 'Deposits, Payments, Guarantees, Units, Charges.'
        },
        {
          id: 'q6',
          question: 'What happens if I click a chart?',
          answer: 'Detailed report with drill-down data opens.'
        },
        {
          id: 'q7',
          question: 'How often is dashboard updated?',
          answer: 'In real-time with EMS transactions.'
        },
        {
          id: 'q8',
          question: 'Can I export dashboard?',
          answer: 'Yes, PDF/Excel formats supported.'
        },
        {
          id: 'q9',
          question: 'Does dashboard show balances?',
          answer: 'Yes, opening/closing balances are shown.'
        },
        {
          id: 'q10',
          question: 'What does Deposits chart mean?',
          answer: 'Distribution of categorized deposits.'
        },
        {
          id: 'q11',
          question: 'What does Payments chart mean?',
          answer: 'Project expense categories and volumes.'
        },
        {
          id: 'q12',
          question: 'What are Guarantee indicators?',
          answer: 'Summarized guarantees received, linked to projects.'
        },
        {
          id: 'q13',
          question: 'What is Retention display?',
          answer: 'Shows balance in retention accounts.'
        },
        {
          id: 'q14',
          question: 'Are VAT deposits displayed?',
          answer: 'Yes, VAT and taxes are displayed in charts.'
        },
        {
          id: 'q15',
          question: 'What if dashboard shows \'No Data\'?',
          answer: 'Means no transactions in selected filters.'
        }
      ]
    },
    {
      id: 'developer-faq',
      title: 'Onboarding – Developer',
      faqs: [
        {
          id: 'q16',
          question: 'What is Developer CIF?',
          answer: 'Unique 8-digit code validated with banking system.'
        },
        {
          id: 'q17',
          question: 'What is Developer Registration No.?',
          answer: '14-character official registration ID.'
        },
        {
          id: 'q18',
          question: 'What is Parent Developer?',
          answer: 'If developer is subsidiary, parent company can be linked.'
        },
        {
          id: 'q19',
          question: 'What is RERA Registration Date?',
          answer: 'Official date of RERA registration.'
        },
        {
          id: 'q20',
          question: 'What if CIF is invalid?',
          answer: 'System throws error and onboarding halts.'
        },
        {
          id: 'q21',
          question: 'Can developer name be changed?',
          answer: 'English name cannot, Hindi name can be manually updated.'
        },
        {
          id: 'q22',
          question: 'What are mandatory fields?',
          answer: 'CIF, Registration No., Name, RERA Reg Date, Address, Contact.'
        },
        {
          id: 'q23',
          question: 'What docs required?',
          answer: 'PAN, Aadhaar, License, Registration Certificates.'
        },
        {
          id: 'q24',
          question: 'What formats allowed?',
          answer: 'PDF, Word, Excel, JPEG, TIFF (≤2MB).'
        },
        {
          id: 'q25',
          question: 'Can docs be replaced?',
          answer: 'Yes, new uploads replace existing before save.'
        },
        {
          id: 'q26',
          question: 'What is World Check?',
          answer: 'Compliance screening indicator for high-risk entities.'
        },
        {
          id: 'q27',
          question: 'What if duplicate CIF entered?',
          answer: 'System rejects with \'Duplicate CIF\' error.'
        },
        {
          id: 'q28',
          question: 'Can multiple contacts be stored?',
          answer: 'Yes, up to 5 contacts with phone/email.'
        },
        {
          id: 'q29',
          question: 'What if email format invalid?',
          answer: 'System prevents save until corrected.'
        },
        {
          id: 'q30',
          question: 'Can beneficiaries be linked?',
          answer: 'Yes, TR and TT beneficiaries can be added.'
        }
      ]
    },
    {
      id: 'project-faq',
      title: 'Onboarding – Project',
      faqs: [
        {
          id: 'q31',
          question: 'What is RERA Project Number?',
          answer: 'Unique ID issued by regulator.'
        },
        {
          id: 'q32',
          question: 'What if RERA ID already exists?',
          answer: 'System rejects with duplication error.'
        },
        {
          id: 'q33',
          question: 'What is Retention %?',
          answer: 'Mandatory fund lock percentage (default 5%).'
        },
        {
          id: 'q34',
          question: 'Can multiple retention % be set?',
          answer: 'Yes, extra retention can be defined.'
        },
        {
          id: 'q35',
          question: 'What statuses supported?',
          answer: 'Active, Cancelled, Completed, Frozen, Closed.'
        },
        {
          id: 'q36',
          question: 'What account types allowed?',
          answer: 'Trust, Retention, Sub-construction, Corporate.'
        },
        {
          id: 'q37',
          question: 'What is IBAN validation?',
          answer: 'System verifies IBAN against bank records.'
        },
        {
          id: 'q38',
          question: 'What if account mismatch?',
          answer: 'System throws \'Invalid Account\' error.'
        },
        {
          id: 'q39',
          question: 'What project fees categories exist?',
          answer: 'Unit Registration, Engineer, Maintenance, Closure, Custom fees.'
        },
        {
          id: 'q40',
          question: 'What are beneficiaries?',
          answer: 'Internal TR and external TT/MC accounts.'
        },
        {
          id: 'q41',
          question: 'Can projects have multiple accounts?',
          answer: 'Yes, each type can be added once.'
        },
        {
          id: 'q42',
          question: 'What is Special Approval?',
          answer: 'Upload document to override rules.'
        },
        {
          id: 'q43',
          question: 'Can Payment Plans be added?',
          answer: 'Yes, Installment or Completion based plans supported.'
        },
        {
          id: 'q44',
          question: 'What file size allowed for docs?',
          answer: '≤25MB for project-related uploads.'
        },
        {
          id: 'q45',
          question: 'What if project is frozen?',
          answer: 'Transactions blocked until unfrozen.'
        }
      ]
    },
    {
      id: 'investor-faq',
      title: 'Onboarding – Investor',
      faqs: [
        {
          id: 'q46',
          question: 'How are investors onboarded?',
          answer: 'Bank uploads Excel with investor details.'
        },
        {
          id: 'q47',
          question: 'What fields captured?',
          answer: 'Name, ID, Contact, Email, Nationality, Unit details.'
        },
        {
          id: 'q48',
          question: 'Can joint owners exist?',
          answer: 'Yes, up to 5 per unit.'
        },
        {
          id: 'q49',
          question: 'What if ownership not 100%?',
          answer: 'System rejects until corrected.'
        },
        {
          id: 'q50',
          question: 'What docs supported?',
          answer: 'Passport, Voter ID, Aadhaar, Trade License.'
        },
        {
          id: 'q51',
          question: 'What file size limit?',
          answer: '≤25MB for each doc.'
        },
        {
          id: 'q52',
          question: 'What happens if duplicate unit?',
          answer: 'Error report generated, entry skipped.'
        },
        {
          id: 'q53',
          question: 'How to handle resale?',
          answer: 'Mark resale and upload new investor details.'
        },
        {
          id: 'q54',
          question: 'What if unit cancelled?',
          answer: 'Set status to \'Cancelled\', system blocks deposits.'
        },
        {
          id: 'q55',
          question: 'Can VAT be applied?',
          answer: 'Yes, VAT toggle available per unit.'
        },
        {
          id: 'q56',
          question: 'Can multiple units link to one investor?',
          answer: 'Yes, same investor ID can own several units.'
        },
        {
          id: 'q57',
          question: 'What if invalid email entered?',
          answer: 'System prevents save until corrected.'
        },
        {
          id: 'q58',
          question: 'What if invalid phone entered?',
          answer: 'System checks 10-12 digit numeric validation.'
        },
        {
          id: 'q59',
          question: 'What are investor payment plans?',
          answer: 'Installment or % completion-based.'
        },
        {
          id: 'q60',
          question: 'What if Excel upload fails?',
          answer: 'Error log generated with failed rows.'
        }
      ]
    },
    {
      id: 'deposits-faq',
      title: 'Deposits',
      faqs: [
        {
          id: 'q61',
          question: 'What deposit types exist?',
          answer: 'Cheque, Transfer, Remittance, Card, Cash.'
        },
        {
          id: 'q62',
          question: 'What is unrecognized deposit?',
          answer: 'Deposit with no project/investor mapping.'
        },
        {
          id: 'q63',
          question: 'What is unallocated deposit?',
          answer: 'Deposit pending category allocation.'
        },
        {
          id: 'q64',
          question: 'How to allocate deposits?',
          answer: 'Manual allocation or bulk Excel upload.'
        },
        {
          id: 'q65',
          question: 'What if invalid allocation file?',
          answer: 'System rejects and logs errors.'
        },
        {
          id: 'q66',
          question: 'Can deposits be split?',
          answer: 'Yes, across categories/units.'
        },
        {
          id: 'q67',
          question: 'What is Retention transfer?',
          answer: '5% moved to retention account automatically.'
        },
        {
          id: 'q68',
          question: 'What if retention fails?',
          answer: 'System logs \'Retention Error\' requiring manual fix.'
        },
        {
          id: 'q69',
          question: 'Can deposits be discarded?',
          answer: 'Yes, invalid ones are discarded permanently.'
        },
        {
          id: 'q70',
          question: 'What reports available?',
          answer: 'Deposits by project, type, unit, retention, rollback.'
        },
        {
          id: 'q71',
          question: 'What is rollback?',
          answer: 'Reversing incorrect allocation back to Unrecognized.'
        },
        {
          id: 'q72',
          question: 'What if cheque bounces?',
          answer: 'Deposit flagged \'Bounced\' and removed.'
        },
        {
          id: 'q73',
          question: 'What is Virtual Account?',
          answer: 'Unique account ID per investor/unit for direct deposits.'
        },
        {
          id: 'q74',
          question: 'Can deposits sync with RERA?',
          answer: 'Yes, EMS can send allocations to regulators.'
        },
        {
          id: 'q75',
          question: 'What happens with duplicate deposits?',
          answer: 'System warns and blocks duplicates.'
        }
      ]
    },
    {
      id: 'payments-faq',
      title: 'Payments',
      faqs: [
        {
          id: 'q76',
          question: 'What categories supported?',
          answer: 'Construction, Land, Marketing, Mgmt, Refunds, Reimbursements, Fees.'
        },
        {
          id: 'q77',
          question: 'What is Saved Payment?',
          answer: 'Draft entry not yet submitted.'
        },
        {
          id: 'q78',
          question: 'What is Submitted Payment?',
          answer: 'Waiting for checker authorization.'
        },
        {
          id: 'q79',
          question: 'What is Master Queue?',
          answer: 'Authorized and rejected history.'
        },
        {
          id: 'q80',
          question: 'What is Discarded?',
          answer: 'Invalid entries moved to Discard queue.'
        },
        {
          id: 'q81',
          question: 'What is Maker-Checker?',
          answer: 'Dual control for approvals.'
        },
        {
          id: 'q82',
          question: 'What is DAL?',
          answer: 'Defines number of checkers required per payment amount.'
        },
        {
          id: 'q83',
          question: 'What if project is closed?',
          answer: 'System blocks payments with warning.'
        },
        {
          id: 'q84',
          question: 'What if IBAN invalid?',
          answer: 'Payment rejected with error.'
        },
        {
          id: 'q85',
          question: 'What if beneficiary missing?',
          answer: 'System prevents transaction.'
        },
        {
          id: 'q86',
          question: 'What docs required?',
          answer: 'Invoices, Architect/Engineer/CA certificates.'
        },
        {
          id: 'q87',
          question: 'What if uploaded doc invalid?',
          answer: 'System flags \'Invalid Document\'.'
        },
        {
          id: 'q88',
          question: 'Can failed payments be retried?',
          answer: 'Yes, after correction.'
        },
        {
          id: 'q89',
          question: 'What if checker rejects?',
          answer: 'Sent back to Maker for correction.'
        },
        {
          id: 'q90',
          question: 'Can batch approvals be done?',
          answer: 'Yes, Checkers can authorize multiple at once.'
        }
      ]
    },
    {
      id: 'guarantee-faq',
      title: 'Guarantee',
      faqs: [
        {
          id: 'q91',
          question: 'What guarantees exist?',
          answer: 'Bank, Contractor, Regulatory guarantees.'
        },
        {
          id: 'q92',
          question: 'How to register?',
          answer: 'Enter details and upload doc.'
        },
        {
          id: 'q93',
          question: 'What if invalid doc?',
          answer: 'System rejects upload.'
        },
        {
          id: 'q94',
          question: 'How to liquidate?',
          answer: 'Mark guarantee as liquidated, record deposit.'
        },
        {
          id: 'q95',
          question: 'Can expired guarantees be tracked?',
          answer: 'Yes, expiry alerts are generated.'
        },
        {
          id: 'q96',
          question: 'Are guarantees included in reports?',
          answer: 'Yes, in compliance and closure reports.'
        },
        {
          id: 'q97',
          question: 'What if duplicate guarantee ID?',
          answer: 'System prevents duplicate entry.'
        },
        {
          id: 'q98',
          question: 'What is Guarantee Transaction ID?',
          answer: 'Unique ID assigned on registration.'
        },
        {
          id: 'q99',
          question: 'Can multiple guarantees link to project?',
          answer: 'Yes, multiple can be linked.'
        },
        {
          id: 'q100',
          question: 'What happens when guarantee lapses?',
          answer: 'System auto-flags expired and restricts payments.'
        }
      ]
    },
    {
      id: 'reports-faq',
      title: 'Reports',
      faqs: [
        {
          id: 'q101',
          question: 'What reports available?',
          answer: 'Deposits, Payments, Guarantees, Fees, Compliance, Audit, Bank Charges.'
        },
        {
          id: 'q102',
          question: 'What filters available?',
          answer: 'Developer, Project, Date, Type, Status.'
        },
        {
          id: 'q103',
          question: 'Can reports export?',
          answer: 'Yes, Excel/PDF.'
        },
        {
          id: 'q104',
          question: 'Can reports schedule?',
          answer: 'Yes, daily, weekly, monthly.'
        },
        {
          id: 'q105',
          question: 'What is compliance report?',
          answer: 'Shows deposits vs RERA rules, withdrawals, retention.'
        },
        {
          id: 'q106',
          question: 'What is audit report?',
          answer: 'Tracks all actions with user, date, before/after values.'
        },
        {
          id: 'q107',
          question: 'Who can access which reports?',
          answer: 'Role-based access control applied.'
        },
        {
          id: 'q108',
          question: 'What is failed transaction report?',
          answer: 'Shows all failed deposits/transactions with reasons.'
        },
        {
          id: 'q109',
          question: 'Can report data be emailed?',
          answer: 'Yes, scheduled reports can be emailed to admins.'
        },
        {
          id: 'q110',
          question: 'What is regulator report?',
          answer: 'Summary sent to RERA authorities periodically.'
        }
      ]
    },
    {
      id: 'project-closure-faq',
      title: 'Project Closure',
      faqs: [
        {
          id: 'q111',
          question: 'How to close project?',
          answer: 'Select project → Closure → Upload docs.'
        },
        {
          id: 'q112',
          question: 'What status options exist?',
          answer: 'Closed, Transferred, Converted to Corporate.'
        },
        {
          id: 'q113',
          question: 'What docs required?',
          answer: 'Closure and Guarantee docs.'
        },
        {
          id: 'q114',
          question: 'What happens after closure?',
          answer: 'Accounts frozen, payments blocked.'
        },
        {
          id: 'q115',
          question: 'What if closure rejected?',
          answer: 'Admin can rollback closure.'
        },
        {
          id: 'q116',
          question: 'Can closure fees be added?',
          answer: 'Yes, closure charges applied automatically.'
        },
        {
          id: 'q117',
          question: 'Can partial closure be done?',
          answer: 'Yes, unit-wise closure possible.'
        },
        {
          id: 'q118',
          question: 'What if closure doc missing?',
          answer: 'System blocks closure submission.'
        },
        {
          id: 'q119',
          question: 'What if closure uploaded late?',
          answer: 'Warning generated, audit flagged.'
        },
        {
          id: 'q120',
          question: 'Is closure reported to regulator?',
          answer: 'Yes, closure data is shared.'
        }
      ]
    },
    {
      id: 'user-admin-faq',
      title: 'User Admin & Workflow',
      faqs: [
        {
          id: 'q121',
          question: 'What roles exist?',
          answer: 'Maker, Checker, Admin, Developer, Investor, Authority, Viewer.'
        },
        {
          id: 'q122',
          question: 'What is Maker role?',
          answer: 'Creates entries and drafts.'
        },
        {
          id: 'q123',
          question: 'What is Checker role?',
          answer: 'Authorizes based on DAL rules.'
        },
        {
          id: 'q124',
          question: 'What is Admin role?',
          answer: 'Manages roles, users, permissions.'
        },
        {
          id: 'q125',
          question: 'What if Checker rejects?',
          answer: 'Sent back to Maker.'
        },
        {
          id: 'q126',
          question: 'What is Audit Trail?',
          answer: 'Logs all changes, old/new values.'
        },
        {
          id: 'q127',
          question: 'What if duplicate user email?',
          answer: 'System blocks registration.'
        },
        {
          id: 'q128',
          question: 'Can roles overlap?',
          answer: 'Yes, users can have multiple roles.'
        },
        {
          id: 'q129',
          question: 'How to reset password?',
          answer: 'Use Forgot Password or Admin reset.'
        },
        {
          id: 'q130',
          question: 'How to disable user?',
          answer: 'Admin can deactivate user in settings.'
        },
        {
          id: 'q131',
          question: 'Can user logs be exported?',
          answer: 'Yes, audit logs exportable.'
        },
        {
          id: 'q132',
          question: 'What is session timeout?',
          answer: '30 mins default, configurable.'
        },
        {
          id: 'q133',
          question: 'Can MFA be enabled?',
          answer: 'Yes, for high-privilege users.'
        },
        {
          id: 'q134',
          question: 'What if wrong password entered?',
          answer: 'Account locked after 5 attempts.'
        },
        {
          id: 'q135',
          question: 'Can workflow be customized?',
          answer: 'Yes, Maker-Checker rules configurable per project.'
        }
      ]
    }
  ]


  return (
    <DashboardLayout 
      title="Help" 
      subtitle="CDL Escrow RERA Application - Find answers to common questions and get the support you need"
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto', pb: 6 }}>
        {/* FAQ Sections as Accordions */}
        {faqSections.map((section) => (
          <Accordion 
            key={section.id}
            expanded={expandedSections.includes(section.id)}
            onChange={handleChange(section.id)}
            sx={{ 
              mb: 2, 
              '&:before': { display: 'none' },
              boxShadow: 1,
              '&:hover': { boxShadow: 2 },
              borderRadius: '8px !important',
              overflow: 'hidden'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                backgroundColor: expandedSections.includes(section.id) ? 'primary.50' : 'transparent',
                '&:hover': { backgroundColor: 'primary.50' },
                minHeight: 56
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  ({section.faqs.length} questions)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {section.faqs.map((faq, index) => (
                  <Box key={faq.id}>
                    <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                      Q{index + 1}. {faq.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {faq.answer}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

      </Box>
    </DashboardLayout>
  )
}

export default HelpPage