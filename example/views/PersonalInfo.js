import { FastField, useFormikContext } from 'formik'
import React from 'react'

function PersonalInfo() {
  const { errors, touched } = useFormikContext()

  return (
    <div>
      <div>
        <label htmlFor="userName">Your name: </label>
        <FastField name="userName" id="userName" />
      </div>
      <small style={{ color: 'red' }}>
        {touched.userName && errors.userName}
      </small>
    </div>
  )
}

export default PersonalInfo
