import { PropsWithChildren } from 'react'
import { FormikProps, FormikErrors } from 'formik'
import { Schema } from 'yup'
import { StepWizardProps, StepWizardChildProps } from 'react-step-wizard'

export type AnyFormValue = any

export interface FormikWizardContextValue<
  V extends AnyFormValue = AnyFormValue,
  S = any
> {
  status: S
  setStatus: React.Dispatch<React.SetStateAction<S>>
  values: V
  setValues: React.Dispatch<React.SetStateAction<V>>
}

export interface FormikWizardStepType<
  Values extends any = AnyFormValue,
  CurrentSection extends keyof Values = any
> extends StepWizardChildProps {
  id: string
  component: React.SFC<{}>
  validationSchema?: Schema<any>
  validate?: (values: any) => void | object | Promise<FormikErrors<any>>
  initialValues?: AnyFormValue
  actionLabel?: string
  onAction?: (
    sectionValues: Values,
    formValues: Values[CurrentSection]
  ) => Promise<any>
  keepValuesOnPrevious?: boolean
}

export interface FormikWizardWrapperProps<
  Values extends AnyFormValue = AnyFormValue,
  Status = any
> extends PropsWithChildren<FormikWizardContextValue<Values, Status>> {
  canGoBack: boolean
  goToPreviousStep: () => void
  currentStep: string
  actionLabel?: string
  isLastStep: boolean
  steps: string[]
  childWizardProps: StepWizardChildProps
  isSubmitting: boolean
}

export interface FormikWizardProps<
  Values extends AnyFormValue = AnyFormValue,
  Status = any
> {
  steps: FormikWizardStepType<Values, any>[]
  render: React.SFC<FormikWizardWrapperProps<Values, Status>>
  onSubmit: (values: Values) => void | Promise<void>
  formikProps?: Partial<FormikProps<Values>>
  Form?: any
  wizardProps?: StepWizardProps
}
