import React from 'react'

const Register = () => {
  const submit = e => {
    e.preventDefault()

    fetch(`/api/register`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Register failed')
        return res.text()
      })
  }

  return (
    <form onSubmit={submit}>
      <h1>Register</h1>
      <label>
        Username
        <input type="text"></input>
      </label>
      <label>
        Password
        <input type="password"></input>
      </label>
      <button type="submit">Register</button>
    </form>
  )
}

export default Register
