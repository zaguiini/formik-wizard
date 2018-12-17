import { Step, Values } from './types'

export function getInitialValues(steps: Step[]) {
  return steps.reduce((curr: Values, next) => {
    curr[next.id] = next.initialValues
    return curr
  }, {})
}
