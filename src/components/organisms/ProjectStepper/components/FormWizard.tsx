'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material'
import { useFormContext } from 'react-hook-form'
import {
  stepperLabelSx,
  cardStyles,
  backButtonSx,
  nextButtonSx,
  primaryButtonSx,
} from '../styles'

interface FormWizardStep {
  id: string
  title: string
  description?: string
  component: React.ComponentType<any>
  validation?: (data: any) => boolean | string
  skipValidation?: boolean
}

interface FormWizardProps {
  steps: FormWizardStep[]
  onComplete?: (data: any) => void
  onStepChange?: (stepIndex: number, step: FormWizardStep) => void
  showProgress?: boolean
  allowSkip?: boolean
  sx?: any
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  onComplete,
  onStepChange,
  showProgress = true,
  allowSkip = false,
  sx,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set()) // eslint-disable-line @typescript-eslint/no-unused-vars

  const formContext = useFormContext()

  // Early return if form context is not available
  if (!formContext) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <Typography color="error" align="center">
            Form context not available. Please ensure FormProvider is properly
            set up.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const { trigger, getValues } = formContext

  const currentStep = steps[activeStep]
  const isLastStep = activeStep === steps.length - 1
  const isFirstStep = activeStep === 0

  const handleNext = useCallback(async () => {
    if (!currentStep) return

    // Skip validation if step allows it
    if (currentStep.skipValidation) {
      setActiveStep((prev) => prev + 1)
      const nextStep = steps[activeStep + 1]
      if (nextStep) {
        onStepChange?.(activeStep + 1, nextStep)
      }
      return
    }

    // Validate current step
    const isValid = await trigger()

    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, activeStep]))
      setSkippedSteps((prev) => {
        const newSet = new Set(prev)
        newSet.delete(activeStep)
        return newSet
      })

      if (isLastStep) {
        onComplete?.(getValues())
      } else {
        setActiveStep((prev) => prev + 1)
        const nextStep = steps[activeStep + 1]
        if (nextStep) {
          onStepChange?.(activeStep + 1, nextStep)
        }
      }
    }
  }, [
    activeStep,
    currentStep,
    isLastStep,
    trigger,
    onComplete,
    onStepChange,
    getValues,
    steps,
  ])

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      setActiveStep((prev) => prev - 1)
      const prevStep = steps[activeStep - 1]
      if (prevStep) {
        onStepChange?.(activeStep - 1, prevStep)
      }
    }
  }, [activeStep, isFirstStep, onStepChange, steps])

  const handleSkip = useCallback(() => {
    if (allowSkip && currentStep) {
      setSkippedSteps((prev) => new Set([...prev, activeStep]))
      setCompletedSteps((prev) => {
        const newSet = new Set(prev)
        newSet.delete(activeStep)
        return newSet
      })

      if (isLastStep) {
        onComplete?.(getValues())
      } else {
        setActiveStep((prev) => prev + 1)
        const nextStep = steps[activeStep + 1]
        if (nextStep) {
          onStepChange?.(activeStep + 1, nextStep)
        }
      }
    }
  }, [
    activeStep,
    currentStep,
    isLastStep,
    allowSkip,
    onComplete,
    onStepChange,
    getValues,
    steps,
  ])

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      // Allow navigation to completed steps or next step
      if (stepIndex <= activeStep || completedSteps.has(stepIndex)) {
        setActiveStep(stepIndex)
        const step = steps[stepIndex]
        if (step) {
          onStepChange?.(stepIndex, step)
        }
      }
    },
    [activeStep, completedSteps, onStepChange, steps]
  )

  const progress = useMemo(() => {
    const totalSteps = steps.length
    const completedCount = completedSteps.size
    return (completedCount / totalSteps) * 100
  }, [steps.length, completedSteps.size])

  // Removed unused getStepStatus function

  if (!currentStep) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <Typography color="error" align="center">
            No steps available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={sx}>
      {/* Progress Bar */}
      {showProgress && (
        <Box mb={3}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Progress: {Math.round(progress)}% ({completedSteps.size}/
            {steps.length} steps completed)
          </Typography>
        </Box>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step
            key={step.id}
            completed={completedSteps.has(index)}
            sx={{ cursor: 'pointer' }}
            onClick={() => handleStepClick(index)}
          >
            <StepLabel>
              <Typography variant="caption" sx={stepperLabelSx}>
                {step.title}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Current Step Content */}
      <Card sx={cardStyles}>
        <CardContent>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              {currentStep.title}
            </Typography>
            {currentStep.description && (
              <Typography variant="body2" color="textSecondary">
                {currentStep.description}
              </Typography>
            )}
          </Box>

          <currentStep.component />

          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              onClick={handleBack}
              disabled={isFirstStep}
              variant="outlined"
              sx={backButtonSx}
            >
              Back
            </Button>

            <Box>
              {allowSkip && !currentStep.skipValidation && (
                <Button onClick={handleSkip} variant="text" sx={{ mr: 2 }}>
                  Skip
                </Button>
              )}

              <Button
                onClick={handleNext}
                variant="contained"
                sx={isLastStep ? primaryButtonSx : nextButtonSx}
              >
                {isLastStep ? 'Complete' : 'Next'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
