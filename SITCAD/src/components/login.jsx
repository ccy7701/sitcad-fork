import { useState } from "react";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();
    alert(isLogin ? "Logging in..." : "Signing up...");
  }

  return (
    <div>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <label htmlFor="name">Name:</label>
            <input id="name" type="text" required />
            <br /><br />
          </>
        )}

        <label htmlFor="email">Email:</label>
        <input id="email" type="email" required />
        <br /><br />

        <label htmlFor="password">Password:</label>
        <input id="password" type="password" minLength={5} required />
        <br /><br />

        <button type="submit">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <br />

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "Don't have an account? Sign Up"
          : "Already have an account? Login"}
      </button>
    </div>
  );
}
