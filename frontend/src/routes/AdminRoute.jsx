import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const role = localStorage.getItem("role"); // store after login

  if (role !== "admin") {
    return <Navigate to="/app/feed" replace />;
  }

  return <Outlet />;
}
