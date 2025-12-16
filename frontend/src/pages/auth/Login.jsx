import { useState, useEffect } from "react"; // 👈 add useEffect
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ ADD THIS BLOCK
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/app/feed", { replace: true });
    }
  }, [navigate]);
  // ✅ END

  const login = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
  localStorage.setItem("role", res.data.role);
  localStorage.setItem("userId", res.data.userId);
  localStorage.setItem("email", res.data.email);


      toast.success("Login successful");

      navigate(
        res.data.role === "admin" ? "/app/admin" : "/app/feed",
        { replace: true }
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
   
  <div className="min-h-screen flex items-center justify-center bg-background">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className="
          w-[360px]
          border border-white/20
          bg-card
          shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]
        "
      >
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center text-foreground">
            Login
          </h2>

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-white/20 focus-visible:border-primary focus-visible:ring-primary/40"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-white/20 focus-visible:border-primary focus-visible:ring-primary/40"
          />

          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={login}
            disabled={loading}
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* GOOGLE LOGIN */}
          <Button
            variant="outline"
            className="w-full border-white/20 hover:border-primary/40"
            onClick={() =>
              (window.location.href =
                "http://localhost:5000/auth/google")
            }
          >
            Continue with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            <span
              className="underline cursor-pointer hover:text-primary"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </span>
          </p>
          <p className="text-xs text-center text-muted-foreground">
  Don&apos;t have an account?{" "}
  <span
    className="cursor-pointer underline hover:text-primary"
    onClick={() => navigate("/signup")}
  >
    Sign up
  </span>
</p>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);
}
