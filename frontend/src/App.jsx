import { Routes, Route } from "react-router-dom";

/* AUTH PAGES (existing) */
import Signup from "./pages/auth/Signup";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import OAuthSuccess from "./pages/auth/OAuthSuccess";

/* APP PAGES */
import Feed from "./pages/Feed";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import Forum from "./pages/Forum";
import Home from "./pages/Home";


/* ROUTES & LAYOUTS */
import ProtectedRoute from "./routes/ProtectedRoutes";
import AdminRoute from "./routes/AdminRoute";
import AppLayout from "./layouts/AppLayout";


export default function App() {
  return (
    <Routes>

      {/* 🔓 PUBLIC AUTH ROUTES */}
      <Route element={<AppLayout/>}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Route>

      {/* 🔐 PROTECTED APP ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app/feed" element={<Feed />} />
          <Route path="/app/leaderboard" element={<Leaderboard />} />
          <Route path="/app/forum" element={<Forum />} />

          {/* 👮 ADMIN ONLY */}
          <Route element={<AdminRoute />}>
            <Route path="/app/admin" element={<Admin />} />
          </Route>
        </Route>
      </Route>

    </Routes>
  );
}
