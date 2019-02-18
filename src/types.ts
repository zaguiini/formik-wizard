import { Schema } from 'yup'
import { FormikProps } from 'formik'
import { WizardContext } from 'react-albus'

export interface Values {
  [key: string]: any
}

export type WizardOnAction = (
  stepValues: Values,
  formValues: Values
) => Promise<any>

export interface Step {
  id: string
  component: React.SFC<any>
  validationSchema?: Schema<any>
  initialValues: Values
  onAction?: WizardOnAction
  keepValues?: boolean
  actionLabel?: string
}

export interface WizardInfo {
  canGoBack: boolean
  goToPreviousStep: () => void
  currentStep: Step['id']
  isLastStep: boolean
  steps: string[]
  wizard: WizardContext
  isSubmitting: boolean
  actionLabel?: string
}

export interface WrapperProps {
  status?: any
  values: Values
  Step: Step['component']
  info: WizardInfo
}

export interface FormikWizardProps {
  steps: Step[]
  render: React.SFC<WrapperProps>
  onSubmit(values: Values): void
  formikProps?: FormikProps<Values>
  Form: any
}

export interface FormikWizardState {
  status: any
  values: Values
}
