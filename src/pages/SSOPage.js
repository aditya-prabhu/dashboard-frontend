import React from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";

function SSOPage() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect();
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Single Sign-On (SSO) Page</h2>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {accounts[0]?.username}</p>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Sign In with SSO</button>
      )}
    </div>
  );
}

export default SSOPage;