import { FastField, useFormikContext } from 'formik'
import React from 'react'

function CompanyInfo() {
  const { errors, touched } = useFormikContext()

  return (
    <div>
      <div>
        <label htmlFor="companyName">Company's name: </label>
        <FastField name="companyName" id="companyName" />
      </div>
      <small style={{ color: 'red' }}>
        {touched.companyName && errors.companyName}
      </small>
      <div>(try typing "argh!" once)</div>
    </div>
  )
}

export default CompanyInfo
