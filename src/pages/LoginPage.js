import React from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { Navigate } from "react-router-dom";

function LoginPage() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect();
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #3949ab 0%, #1976d2 100%)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(25, 118, 210, 0.2)",
          padding: "48px 40px",
          minWidth: 350,
          textAlign: "center",
        }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
          alt="Microsoft Logo"
          style={{ width: 80, marginBottom: 24 }}
        />
        <h2 style={{ color: "#1976d2", marginBottom: 8 }}>Welcome</h2>
        <p style={{ color: "#555", marginBottom: 32 }}>
          Sign in with your Microsoft account to access the dashboard.
        </p>
        <button
          onClick={handleLogin}
          style={{
            background: "linear-gradient(90deg, #1976d2 0%, #3949ab 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
            transition: "background 0.2s",
          }}
        >
          <span style={{ marginRight: 10, verticalAlign: "middle" }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 48 48"
              style={{ verticalAlign: "middle" }}
            >
              <rect fill="#f35325" x="1" y="1" width="21" height="21" />
              <rect fill="#81bc06" x="26" y="1" width="21" height="21" />
              <rect fill="#05a6f0" x="1" y="26" width="21" height="21" />
              <rect fill="#ffba08" x="26" y="26" width="21" height="21" />
            </svg>
          </span>
          Sign In with SSO
        </button>
      </div>
    </div>
  );
}

export default LoginPage;