import { useState, useCallback, useRef } from 'react'

interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isSubmitting: boolean
}

interface UseFormOptions<T> {
  initialValues: T
  validationSchema?: Record<keyof T, (value: unknown) => string | undefined>
  onSubmit?: (values: T) => void | Promise<void>
}

export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) {
  const { initialValues, validationSchema, onSubmit } = options
  
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
  })

  const formRef = useRef<HTMLFormElement>(null)

  const validateField = useCallback(
    (name: keyof T, value: unknown): string | undefined => {
      if (!validationSchema || !validationSchema[name]) return undefined
      return validationSchema[name](value)
    },
    [validationSchema]
  )

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(state.values).forEach((key) => {
      const fieldKey = key as keyof T
      const error = validateField(fieldKey, state.values[fieldKey])
      if (error) {
        errors[fieldKey] = error
        isValid = false
      }
    })

    setState(prev => ({ ...prev, errors, isValid }))
    return isValid
  }, [state.values, validateField])

  const setFieldValue = useCallback(
    (name: keyof T, value: unknown) => {
      setState(prev => ({
        ...prev,
        values: { ...prev.values, [name]: value },
        errors: { ...prev.errors, [name]: validateField(name, value) },
        touched: { ...prev.touched, [name]: true },
      }))
    },
    [validateField]
  )

  const setFieldTouched = useCallback(
    (name: keyof T, touched: boolean = true) => {
      setState(prev => ({
        ...prev,
        touched: { ...prev.touched, [name]: touched },
      }))
    },
    []
  )

  const setFieldError = useCallback(
    (name: keyof T, error: string) => {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: error },
        isValid: false,
      }))
    },
    []
  )

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
    })
  }, [initialValues])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      if (!validateForm()) {
        return
      }

      if (!onSubmit) return

      setState(prev => ({ ...prev, isSubmitting: true }))

      try {
        await onSubmit(state.values)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }))
      }
    },
    [state.values, validateForm, onSubmit]
  )

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: state.values[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFieldValue(name, e.target.value)
      },
      onBlur: () => setFieldTouched(name),
      error: state.errors[name],
      touched: state.touched[name],
    }),
    [state.values, state.errors, state.touched, setFieldValue, setFieldTouched]
  )

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    handleSubmit,
    getFieldProps,
    formRef,
  }
} 