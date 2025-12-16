import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    await api.post("/auth/forgot-password", { email });
    navigate("/reset-password", { state: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-80">
        <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <Button className="w-full" onClick={sendOtp}>Send OTP</Button>
      </div>
    </div>
  );
}
