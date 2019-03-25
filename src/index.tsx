import React from 'react'
import {
  Wizard as BaseWizard,
  Steps as AlbusSteps,
  Step as AlbusStep,
  WizardContext,
} from 'react-albus'
import { Formik, FormikActions, getIn } from 'formik'
import { produce } from 'immer'
import {
  FormikWizardProps,
  FormikWizardState,
  Step,
  Values,
  WizardOnAction,
} from './types'
import { getInitialValues } from './helpers'

interface FormikWizardContextInterface<V> {
  status: any
  values: V
  setFormValue: (key: string, value: any) => void
  setFormStatus: (status: any) => void
  wizard: WizardContext
}

const FormikWizardContext = React.createContext<FormikWizardContextInterface<
  any
> | null>(null)

export function useFormikWizard<V>() {
  return React.useContext(FormikWizardContext) as FormikWizardContextInterface<
    V
  >
}

class FormikWizard extends React.PureComponent<
  FormikWizardProps,
  FormikWizardState
> {
  constructor(props: FormikWizardProps) {
    super(props)

    this.state = {
      status: undefined,
      values: getInitialValues(props.steps),
      isSubmitting: false,
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.onAction = this.onAction.bind(this)
    this.renderStep = this.renderStep.bind(this)
    this.renderStepComponent = this.renderStepComponent.bind(this)
  }

  componentDidUpdate(prevProps: FormikWizardProps) {
    if (prevProps.steps !== this.props.steps) {
      this.setState({
        status: undefined,
        isSubmitting: false,
        values: getInitialValues(this.props.steps),
      })
    }
  }

  async onAction(
    stepValues: Values,
    stepFormActions: FormikActions<Values>,
    wizard: WizardContext,
    onAction?: WizardOnAction
  ) {
    this.setState({
      isSubmitting: true,
    })

    let status = undefined

    try {
      if (wizard.steps[wizard.steps.length - 1].id === wizard.step.id) {
        status = await this.props.onSubmit(this.state.values)
      } else {
        if (onAction) {
          status = await onAction(stepValues, this.state.values)
        }

        wizard.next()
      }
    } catch (error) {
      status = error.status
    } finally {
      this.setState({
        status,
        isSubmitting: false,
      })
    }
  }

  handleSubmit(
    stepValues: Values,
    stepFormActions: FormikActions<Values>,
    wizard: WizardContext,
    onAction?: WizardOnAction
  ) {
    this.setState(
      ({ values }) => ({
        status: undefined,
        values: {
          ...values,
          [wizard.step.id]: stepValues,
        },
      }),
      () => this.onAction(stepValues, stepFormActions, wizard, onAction)
    )
  }

  getStepInitialValues(step: Step, stepId: Step['id']) {
    if (step.keepValues === false) {
      return step.initialValues
    } else {
      return this.state.values[stepId]
    }
  }

  setFormValue = (key: string, value: any) => {
    this.setState(state =>
      produce(state, draft => {
        const path = key.split('.')
        const placeToUpdate = path.pop()!
        const finalPath = path.join('.')

        const place = getIn(draft.values, finalPath)
        place[placeToUpdate] = value
      })
    )
  }

  setFormStatus = (status: any) => {
    this.setState({
      status,
    })
  }

  renderStepComponent(step: Step, wizard: WizardContext) {
    const info = {
      canGoBack: wizard.step.id !== wizard.steps[0].id,
      goToPreviousStep: () => {
        wizard.previous()

        this.setState({
          status: undefined,
        })
      },

      currentStep: wizard.step.id,
      actionLabel: step.actionLabel,
      steps: wizard.steps.map(step => step.id),
      isLastStep: wizard.step.id === wizard.steps[wizard.steps.length - 1].id,
      wizard,
    }

    const FormElement = this.props.Form || 'form'
    const Element = this.props.render
    const Step = step.component

    return (
      <Formik
        {...this.props.formikProps}
        initialValues={this.getStepInitialValues(step, wizard.step.id)}
        validationSchema={step.validationSchema}
        onSubmit={(stepValues, stepFormActions) =>
          this.handleSubmit(stepValues, stepFormActions, wizard, step.onAction)
        }
        render={({ handleSubmit }) => (
          <FormElement onSubmit={handleSubmit}>
            <Element
              info={{ ...info, isSubmitting: this.state.isSubmitting }}
              {...this.state}
            >
              <Step />
            </Element>
          </FormElement>
        )}
      />
    )
  }

  renderStep(step: Step) {
    return (
      <AlbusStep
        key={step.id}
        id={step.id}
        render={wizard => this.renderStepComponent(step, wizard)}
      />
    )
  }

  render() {
    return (
      <BaseWizard
        render={wizard => (
          <FormikWizardContext.Provider
            value={{
              ...this.state,
              setFormValue: this.setFormValue,
              setFormStatus: this.setFormStatus,
              wizard,
            }}
          >
            <AlbusSteps>{this.props.steps.map(this.renderStep)}</AlbusSteps>
          </FormikWizardContext.Provider>
        )}
      />
    )
  }
}

export default FormikWizard
