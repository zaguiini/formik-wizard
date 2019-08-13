import { Form as DefaultForm, Formik, FormikProps } from 'formik'
import produce from 'immer'
import React from 'react'
import { Step as AlbusStep, Steps as AlbusSteps, Wizard as AlbusWizard, WizardContext } from 'react-albus'

import {
  FormikWizardBaseValues,
  FormikWizardContextValue,
  FormikWizardProps,
  FormikWizardStepType,
  FormikWizardWrapperProps,
} from './types'

function getInitialValues(steps: FormikWizardStepType[]) {
  return steps.reduce<FormikWizardBaseValues>((curr, next) => {
    curr[next.id] = next.initialValues
    return curr
  }, {})
}

const FormikWizardContext = React.createContext<FormikWizardContextValue | null>(
  null
)

interface FormikWizardStepProps
  extends FormikWizardContextValue<FormikWizardBaseValues, any> {
  step: FormikWizardStepType
  Form?: any
  steps: string[]
  FormWrapper: React.SFC<FormikWizardWrapperProps<any>>
  wizard: WizardContext
  formikProps?: Partial<FormikProps<any>>
  onSubmit: FormikWizardProps<any>['onSubmit']
}

function FormikWizardStep({
  step,
  Form = DefaultForm,
  FormWrapper,
  steps,
  wizard,
  formikProps,
  onSubmit,
  setStatus,
  status,
  values,
  setValues,
}: FormikWizardStepProps) {
  const info = React.useMemo(() => {
    return {
      canGoBack: steps[0] !== step.id,
      currentStep: step.id,
      isLastStep: steps[steps.length - 1] === step.id,
    }
  }, [steps, step])

  const handleSubmit = React.useCallback(
    async (sectionValues) => {
      setStatus(undefined)

      let status

      try {
        if (info.isLastStep) {
          const newValues = produce(values, (draft: any) => {
            draft[info.currentStep] = sectionValues
          })

          status = await onSubmit(newValues)
          setValues(newValues)
        } else {
          status = step.onAction
            ? await step.onAction(sectionValues, values)
            : undefined

          setValues((values: any) => {
            return produce(values, (draft: any) => {
              draft[info.currentStep] = sectionValues
            })
          })

          setImmediate(wizard.next)
        }
      } catch (e) {
        status = e
      }

      setStatus(status)
    },
    [
      info.currentStep,
      info.isLastStep,
      onSubmit,
      setStatus,
      setValues,
      step,
      values,
      wizard.next,
    ]
  )

  return (
    <Formik
      {...formikProps}
      enableReinitialize
      initialValues={step.initialValues}
      validationSchema={step.validationSchema}
      validate={step.validate}
      onSubmit={handleSubmit}
      render={(props) => (
        <Form onSubmit={props.handleSubmit}>
          <FormWrapper
            {...info}
            steps={steps}
            wizard={wizard}
            actionLabel={step.actionLabel}
            isSubmitting={props.isSubmitting}
            goToPreviousStep={() => {
              setStatus(undefined)

              if (step.keepValuesOnPrevious) {
                setValues((values: any) =>
                  produce(values, (draft: any) => {
                    draft[step.id] = props.values
                  })
                )
              }

              wizard.previous()
            }}
            status={status}
            values={values}
            setStatus={status}
            setValues={setValues}
          >
            {React.createElement(step.component)}
          </FormWrapper>
        </Form>
      )}
    />
  )
}

export function FormikWizard<T>({
  formikProps,
  albusProps,
  onSubmit,
  steps,
  Form,
  render,
}: FormikWizardProps<T>) {
  const [status, setStatus] = React.useState(undefined)
  const [values, setValues] = React.useState(() => getInitialValues(steps))

  React.useEffect(() => {
    setValues(getInitialValues(steps))
    setStatus(undefined)
  }, [steps])

  const stepIds = React.useMemo(() => steps.map((step) => step.id), [steps])

  return (
    <AlbusWizard {...albusProps}>
      <FormikWizardContext.Provider
        value={{
          status,
          setStatus,
          values,
          setValues,
        }}
      >
        <AlbusSteps>
          {steps.map((step) => (
            <AlbusStep
              key={step.id}
              id={step.id}
              render={(wizard) => (
                <FormikWizardStep
                  wizard={wizard}
                  formikProps={formikProps}
                  onSubmit={onSubmit}
                  steps={stepIds}
                  status={status}
                  values={values}
                  setValues={setValues}
                  setStatus={setStatus}
                  step={{
                    ...step,
                    initialValues: values[step.id] || {},
                  }}
                  Form={Form}
                  FormWrapper={render}
                />
              )}
            />
          ))}
        </AlbusSteps>
      </FormikWizardContext.Provider>
    </AlbusWizard>
  )
}

export default FormikWizard

export function useFormikWizard<T>() {
  return React.useContext(FormikWizardContext) as FormikWizardContextValue<T>
}
