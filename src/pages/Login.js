import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setErrorMsg("Incorrect email or password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6">
      <h1 className="text-3xl font-semibold mb-6">Login</h1>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm flex flex-col space-y-4"
      >
        <input
          type="email"
          className="border rounded px-3 py-2 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border rounded px-3 py-2 w-full"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default Login;
