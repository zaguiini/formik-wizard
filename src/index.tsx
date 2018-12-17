import React from 'react'
import {
  Wizard as BaseWizard,
  Steps as AlbusSteps,
  Step as AlbusStep,
  WizardContext,
} from 'react-albus'
import { Formik, FormikActions } from 'formik'
import { FormikWizardProps, FormikWizardState, Step, Values, WizardOnNext } from './types'
import { getInitialValues } from './helpers'

class FormikWizard extends React.PureComponent<FormikWizardProps, FormikWizardState> {
  constructor(props: FormikWizardProps) {
    super(props)

    this.state = {
      status: undefined,
      values: getInitialValues(props.steps),
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.onNext = this.onNext.bind(this)
    this.renderStep = this.renderStep.bind(this)
    this.renderStepComponent = this.renderStepComponent.bind(this)
  }

  async onNext(stepValues: Values, stepFormActions: FormikActions<Values>, wizard: WizardContext, onNext?: WizardOnNext) {
    let status = undefined

    try {
      if(wizard.steps[wizard.steps.length - 1].id === wizard.step.id) {
        status = await this.props.onSubmit(this.state.values)
      } else {
        if(onNext) {
          status = await onNext(stepValues, this.state.values)
        }

        wizard.next()
      }
    } catch(error) {
      status = error.status
    }

    this.setState({
      status,
    })

    stepFormActions.setSubmitting(false)
  }

  handleSubmit(stepValues: Values, stepFormActions: FormikActions<Values>, wizard: WizardContext, onNext?: WizardOnNext) {
    this.setState(({ values }) => ({
      status: undefined,
      values: {
        ...values,
        [wizard.step.id]: stepValues,
      },
    }), () => this.onNext(stepValues, stepFormActions, wizard, onNext))
  }

  getStepInitialValues(step: Step, stepId: Step["id"]) {
    if(step.keepValues === false) {
      return step.initialValues
    } else {
      return this.state.values[stepId]
    }
  }

  renderStepComponent(step: Step, wizard: WizardContext) {
    return (
      <Formik
        {...this.props.formikProps}
        initialValues={this.getStepInitialValues(step, wizard.step.id)}
        validationSchema={step.validationSchema}
        onSubmit={(stepValues, stepFormActions) => {
          this.handleSubmit(stepValues, stepFormActions, wizard, step.onNext)
        }}
        render={(formikProps) => (
          <form onSubmit={formikProps.handleSubmit}>
            {React.createElement(this.props.render, {
              ...this.state,
              Step: step.component,
              actions: {
                canGoBack: wizard.step.id !== wizard.steps[0].id,
                goToPreviousStep: () => {
                  wizard.previous()

                  this.setState({
                    status: undefined,
                  })
                },

                currentStep: wizard.step.id,
                isLastStep: wizard.step.id === wizard.steps[wizard.steps.length - 1].id,
                isSubmitting: formikProps.isSubmitting,
              },
            })}
          </form>
        )}
      />
    )
  }

  renderStep(step: Step) {
    return (
      <AlbusStep
        key={step.id}
        id={step.id}
        render={(wizard) => this.renderStepComponent(step, wizard)}
      />
    )
  }

  render() {
    return (
      <BaseWizard>
        <AlbusSteps>
          {this.props.steps.map(this.renderStep)}
        </AlbusSteps>
      </BaseWizard>
    )
  }
}

export default FormikWizard
