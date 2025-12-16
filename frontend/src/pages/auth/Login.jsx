import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    alert("Login successful");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-[360px]">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-center">Login</h2>

            <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

            <Button className="w-full" onClick={login}>Login</Button>

            <p className="text-xs text-center">
              <a href="/forgot-password" className="underline">Forgot password?</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
