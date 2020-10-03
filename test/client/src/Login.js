import React from 'react'

const Login = () => {
  return (
    <form>
      <h1>Login</h1>
      <label>
        Username
        <input type="text"></input>
      </label>
      <label>
        Password
        <input type="password"></input>
      </label>
      <button type="submit">Login</button>
    </form>
  )
}

export default Login
