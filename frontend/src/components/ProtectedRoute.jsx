import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { getCurrentAdmin } from "../services/authApi";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      try {
        await getCurrentAdmin();

        if (active) {
          setStatus("authenticated");
        }
      } catch {
        if (active) {
          setStatus("unauthenticated");
        }
      }
    }

    verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="admin-loading-screen" role="status">
        <div className="admin-loading-spinner" />
        <p>Verifying admin session...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
