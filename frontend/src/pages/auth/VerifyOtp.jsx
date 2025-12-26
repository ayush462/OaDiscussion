import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  const { state } = useLocation();
  const navigate = useNavigate();

  // 🛡️ Direct access protection
  useEffect(() => {
    if (!state?.email) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  /* ================= VERIFY OTP ================= */

  const verify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/verify-otp", {
        email: state.email,
        otp,
      });

      toast.success("Email verified successfully 🎉");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */

  const resendOtp = async () => {
    try {
      setResending(true);

      await api.post("/auth/resend-otp", {
        email: state.email,
      });

      toast.success("OTP resent to your email 📩");
      setCooldown(30);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setResending(false);
    }
  };

  /* ================= COOLDOWN TIMER ================= */

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /* ================= UI ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="w-full flex justify-center mt-20"
    >
      <Card className="w-[360px] border-border shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h2 className="text-lg font-semibold">Verify OTP</h2>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Sent to <span className="font-medium">{state?.email}</span>
          </p>

          <Input
            placeholder="6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
          />

          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={verify}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Verifying..." : "Verify"}
          </Button>

          {/* RESEND OTP */}
          <div className="text-center text-sm">
            {cooldown > 0 ? (
              <span className="text-muted-foreground">
                Resend OTP in {cooldown}s
              </span>
            ) : (
              <button
                onClick={resendOtp}
                disabled={resending}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
