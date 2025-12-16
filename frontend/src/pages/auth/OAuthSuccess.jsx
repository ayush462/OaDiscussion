import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    toast.success("Signed in with Google");

    navigate(
      role === "admin" ? "/app/admin" : "/app/feed",
      { replace: true }
    );
  }, []);

  return null;
}
