import { Schema } from 'yup'
import { FormikProps } from 'formik';

export interface Values {
  [key: string]: any,
}

export type WizardOnNext = (stepValues: Values, formValues: Values) => Promise<any>

export interface Step {
  id: string,
  component: React.SFC<any>,
  validationSchema?: Schema<any>,
  initialValues: Values,
  onNext?: WizardOnNext,
  keepValues?: boolean,
}

export interface WizardActions {
  canGoBack: boolean,
  goToPreviousStep: () => void,
  currentStep: Step["id"],
  isLastStep: boolean,
  isSubmitting: boolean,
}

export interface WrapperProps {
  status?: any,
  values: Values,
  Step: Step["component"],
  actions: WizardActions,
}

export interface FormikWizardProps {
  steps: Step[],
  render: React.SFC<WrapperProps>,
  onSubmit(values: Values): void,
  formikProps?: FormikProps<Values>,
}

export interface FormikWizardState {
  status: any,
  values: Values,
}
