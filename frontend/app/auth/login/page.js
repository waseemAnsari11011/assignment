"use client";
import "../register/register.css";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function Page() {
  const { setAccessToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    document.querySelector(".loaderoverlay").style.display = "flex";

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/login`,
        { email, password },
        { withCredentials: true }
      );

      const { accessToken, user } = res.data;

      setAccessToken(accessToken);

      //  Save user to localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));

      document.querySelector(".loaderoverlay").style.display = "none";

      // Redirect after login
      window.location.href = "/home";
    } catch (err) {
      document.querySelector(".loaderoverlay").style.display = "none";
      console.error(err);
      setError("Login failed. Please check credentials.");
    }
  };

  return (
    <div className="main mymain">
      <div className="left-container">
        <img src="\images\img1.jpg" alt="Profile" className="profile-pic" />
      </div>
      <div className="right-container">
        <div className="form">
          <h1 className="">Buyer Login</h1>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="form-tab">
            <label>Enter Email</label>
            <input
              type="email"
              placeholder="@gmail.com"
              className=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-tab">
            <label>Enter Password</label>
            <input
              type="password"
              placeholder="********"
              className=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button className="form-tab" onClick={handleLogin}>
              Login ➜
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <a
              href="/auth/register"
              style={{ color: "#1389F0", textDecoration: "none" }}
            >
              Don't have an account? Create an account.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
