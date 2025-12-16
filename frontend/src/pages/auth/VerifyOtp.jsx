import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { motion } from "framer-motion";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const verify = async () => {
    await api.post("/auth/verify-otp", { email: state.email, otp });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="w-[360px]">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-center">Verify OTP</h2>
            <p className="text-sm text-center text-muted-foreground">
              Sent to {state.email}
            </p>
            <Input placeholder="6-digit OTP" maxLength={6} onChange={e => setOtp(e.target.value)} />
            <Button className="w-full" onClick={verify}>Verify</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
