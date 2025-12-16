import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signup = async () => {
    await api.post("/auth/signup", { email, password });
    navigate("/verify-otp", { state: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-[360px]">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-center">Create Account</h2>

            <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

            <Button className="w-full" onClick={signup}>
              Sign Up
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href="http://localhost:5000/auth/google"}
            >
              Continue with Google
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Already have an account? <a href="/login" className="underline">Login</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
