import { Form as DefaultForm, Formik, FormikProps } from 'formik'
import produce from 'immer'
import React from 'react'
import StepWizard, { StepWizardChildProps } from 'react-step-wizard'

import {
  AnyFormValue,
  FormikWizardContextValue,
  FormikWizardProps,
  FormikWizardStepType,
  FormikWizardWrapperProps,
} from './types'

function getInitialValues(steps: FormikWizardStepType[]) {
  return steps.reduce<AnyFormValue>((curr, next) => {
    curr[next.id] = next.initialValues
    return curr
  }, {})
}

const FormikWizardContext = React.createContext<FormikWizardContextValue | null>(
  null
)

interface FormikWizardStepProps
  extends FormikWizardContextValue<AnyFormValue, any> {
  step: FormikWizardStepType
  Form?: any
  steps: string[]
  FormWrapper: React.SFC<FormikWizardWrapperProps<any>>
  formikProps?: Partial<FormikProps<any>>
  onSubmit: FormikWizardProps<any>['onSubmit']
  childWizardProps: StepWizardChildProps
}

function FormikWizardStep({
  step,
  Form = DefaultForm,
  FormWrapper,
  steps,
  formikProps,
  childWizardProps,
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

          setImmediate(childWizardProps.nextStep)
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
      childWizardProps.nextStep,
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
    >
      {(props) => (
        <Form onSubmit={props.handleSubmit}>
          <FormWrapper
            {...info}
            steps={steps}
            childWizardProps={childWizardProps}
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

              childWizardProps.previousStep()
            }}
            status={status}
            values={values}
            setStatus={setStatus}
            setValues={setValues}
          >
            {React.createElement(step.component)}
          </FormWrapper>
        </Form>
      )}
    </Formik>
  )
}

export function FormikWizard<T>({
  formikProps,
  wizardProps: userWizardProps,
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

  const topLevelWizardProps = Object.assign(
    {
      transitions: {
        enterRight: '',
        enterLeft: '',
        exitRight: '',
        exitLeft: '',
      },
    },
    userWizardProps
  )

  function StepRenderer({
    i,
    ...childWizardProps
  }: StepWizardChildProps & { i: number }) {
    const step = steps[i]

    return (
      <FormikWizardStep
        formikProps={formikProps}
        childWizardProps={childWizardProps}
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
    )
  }

  // react-step-wizard expects children as arrays
  // https://github.com/jcmcneal/react-step-wizard/blob/6ee7978ccc08021c7e2ca54d9d77a6de3b992117/src/index.js#L179
  const renderSteps = () => {
    return steps.map((_, i) => {
      return React.createElement(StepRenderer, {
        i,
        key: i,
        // other props will be passed down by react-step-wizard on render
      } as any)
    })
  }

  return (
    <FormikWizardContext.Provider
      value={{
        status,
        setStatus,
        values,
        setValues,
      }}
    >
      <StepWizard {...topLevelWizardProps}>{renderSteps()}</StepWizard>
    </FormikWizardContext.Provider>
  )
}

export default FormikWizard

export function useFormikWizard<T>() {
  return React.useContext(FormikWizardContext) as FormikWizardContextValue<T>
}
