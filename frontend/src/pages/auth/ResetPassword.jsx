import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";

export default function ResetPassword() {
  const { state } = useLocation();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const reset = async () => {
    await api.post("/auth/reset-password", {
      email: state.email,
      otp,
      password,
    });
    alert("Password reset successful");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-80">
        <Input placeholder="OTP" onChange={e => setOtp(e.target.value)} />
        <Input type="password" placeholder="New Password" onChange={e => setPassword(e.target.value)} />
        <Button className="w-full" onClick={reset}>Reset Password</Button>
      </div>
    </div>
  );
}
