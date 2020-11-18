// Initial typings by dmk99 - https://github.com/jcmcneal/react-step-wizard/issues/31#issuecomment-505399131

declare module 'react-step-wizard' {
  import * as React from 'react'

  export type StepWizardProps = Partial<
    React.PropsWithChildren<{
      className: string

      hashKey: string
      initialStep: number
      instance: (wizard: StepWizardProps) => void
      isHashEnabled: boolean
      isLazyMount: boolean
      nav: React.ReactNode

      onStepChange: (stepChange: {
        previousStep: number
        activeStep: number
      }) => void

      transitions: {
        enterRight?: string
        enterLeft?: string
        exitRight?: string
        exitLeft?: string
      }
    }>
  >

  export type StepWizardChildProps<
    T extends Record<string, any> = {}
  > = React.PropsWithChildren<{
    isActive: boolean
    currentStep: number
    totalSteps: number
    firstStep: () => void
    lastStep: () => void
    nextStep: () => void
    previousStep: () => void
    goToStep: (step: number) => void
  }> &
    T

  export default class StepWizard extends React.PureComponent<
    StepWizardProps
  > {}
}
