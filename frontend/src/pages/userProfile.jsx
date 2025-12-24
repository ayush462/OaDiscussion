import { useEffect, useState } from "react";
import axios from "axios";
import {
  BadgeCheck,
  Lock,
  Unlock,
  Sparkles,
  Trophy,
  Coins,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [unlocks, setUnlocks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmPack, setConfirmPack] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */

  const fetchData = async () => {
    try {
      const [profileRes, unlockRes] = await Promise.all([
        axios.get("https://oadiscussion.onrender.com/api/users/me/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://oadiscussion.onrender.com/api/users/me/unlocks", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProfile(profileRes.data);
      setUnlocks(unlockRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= LOADER ================= */

  if (loading || !profile || !unlocks) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  /* ================= DERIVED ================= */

  const nextUnlock = unlocks.unlocks.find((u) => !u.unlocked);

  const progress = nextUnlock
    ? Math.min((unlocks.points / nextUnlock.requiredPoints) * 100, 100)
    : 100;

  const isVerified = unlocks.unlocks.some(
    (u) => u.key === "VERIFIED" && u.unlocked
  );

  /* ================= BUY ================= */

  const confirmBuy = async () => {
    const toastId = toast.loading("Converting coins…");

    try {
      await axios.post(
        "https://oadiscussion.onrender.com/api/shop/buy-points",
        { pack: confirmPack.pack },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`+${confirmPack.points} points added`, { id: toastId });
      setConfirmPack(null);
      fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Purchase failed",
        { id: toastId }
      );
      setConfirmPack(null);
    }
  };

  /* ================= PAGE ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="max-w-5xl mx-auto space-y-8 p-4"
    >
      {/* ================= PROFILE HEADER ================= */}
      <Card className="border-white/10 bg-gradient-to-br from-background to-emerald-950/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-emerald-500/40">
              <AvatarFallback className="text-lg font-bold">
                {profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  {profile.email}
                </h2>
                {isVerified && (
                  <BadgeCheck className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your contributor profile
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Trophy className="h-4 w-4 text-emerald-400" />}
            label="Leaderboard Points"
            value={unlocks.points}
            suffix="pts"
            color="text-emerald-400"
          />
          <StatCard
            icon={<Coins className="h-4 w-4 text-yellow-400" />}
            label="Coins"
            value={profile.coins ?? 0}
            color="text-yellow-400"
          />
          <StatCard
            icon={<Building2 className="h-4 w-4 text-sky-400" />}
            label="OA Experiences"
            value={profile.totalPosts}
          />
        </CardContent>

        <CardContent className="space-y-3">
          <Progress value={progress} />
          {nextUnlock ? (
            <p className="text-xs text-muted-foreground">
              Next unlock at{" "}
              <span className="text-emerald-400 font-semibold">
                {nextUnlock.requiredPoints}
              </span>{" "}
              points
            </p>
          ) : (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              All rewards unlocked
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= BUY POINTS (RESTORED) ================= */}
      <Card className="border-white/10">
        <CardHeader className="flex items-center gap-2 flex-row">
          <Coins className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold text-lg">
            Convert Coins to Points
          </h3>
        </CardHeader>

        <CardContent className="grid sm:grid-cols-3 gap-4">
          <ShopPack
            title="Starter"
            subtitle="Small boost"
            coins={10}
            points={5}
            disabled={profile.coins < 10}
            onBuy={() =>
              setConfirmPack({ pack: "small", coins: 10, points: 5 })
            }
          />
          <ShopPack
            title="Pro"
            subtitle="Best value"
            coins={20}
            points={12}
            highlight
            disabled={profile.coins < 20}
            onBuy={() =>
              setConfirmPack({ pack: "medium", coins: 20, points: 12 })
            }
          />
          <ShopPack
            title="Elite"
            subtitle="Top contributors"
            coins={50}
            points={35}
            disabled={profile.coins < 50}
            onBuy={() =>
              setConfirmPack({ pack: "large", coins: 50, points: 35 })
            }
          />
        </CardContent>
      </Card>

      {/* ================= UNLOCKED ASSETS ================= */}
      <Card className="border-white/10">
        <CardHeader className="flex items-center gap-2 flex-row">
          <Trophy className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-lg">Unlocked Assets</h3>
        </CardHeader>

        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlocks.unlocks.map((u) => (
            <div
              key={u.key}
              className={`rounded-xl border p-4 ${
                u.unlocked
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-white/10"
              }`}
            >
              <p className="font-medium">{u.title}</p>
              <div className="mt-3">
                {u.unlocked ? (
                  u.link ? (
                    <Button size="sm" className="w-full" asChild>
                      <a href={u.link} target="_blank" rel="noreferrer">
                        <Unlock className="h-4 w-4 mr-1" />
                        Open
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() =>
                        toast.info("No downloadable link available yet")
                      }
                    >
                      <BadgeCheck className="h-4 w-4 mr-1" />
                      Unlocked
                    </Button>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Locked
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= COMPANY CONTRIBUTIONS ================= */}
      <Card className="border-white/10">
        <CardHeader>
          <h3 className="font-semibold text-lg">
            Company Contributions
          </h3>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent className="relative overflow-hidden py-4">
          {profile.companyTags?.length ? (
            <motion.div
              className="flex gap-3 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: Math.max(20, profile.companyTags.length * 3),
              }}
            >
              {[...profile.companyTags, ...profile.companyTags].map((c, i) => (
                <Badge
                  key={`${c.company}-${c.tag}-${i}`}
                  variant="secondary"
                  className="px-3 py-1 whitespace-nowrap"
                >
                  {c.company}
                  <span className="mx-1 text-muted-foreground">·</span>
                  {c.tag}
                  <span className="ml-1 text-emerald-400 font-semibold">
                    ({c.count})
                  </span>
                </Badge>
              ))}
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No contributions yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= CONFIRM ================= */}
      <AlertDialog open={!!confirmPack} onOpenChange={() => setConfirmPack(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Conversion</AlertDialogTitle>
            <AlertDialogDescription>
              Convert{" "}
              <span className="font-semibold text-yellow-400">
                {confirmPack?.coins} coins
              </span>{" "}
              into{" "}
              <span className="font-semibold text-emerald-400">
                {confirmPack?.points} leaderboard points
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBuy}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

/* ================= HELPERS ================= */

function StatCard({ icon, label, value, suffix, color }) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-background/50">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-bold mt-1 ${color || ""}`}>
        {value}
        {suffix && (
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

function ShopPack({
  title,
  subtitle,
  coins,
  points,
  onBuy,
  disabled,
  highlight,
}) {
  return (
    <Card
      className={`p-4 text-center transition relative ${
        disabled
          ? "opacity-50 border-white/10"
          : highlight
          ? "border-yellow-500/40 bg-yellow-500/10"
          : "border-white/10 bg-background/50"
      }`}
    >
      {highlight && (
        <Badge className="absolute -top-2 right-3 bg-yellow-500/20 text-yellow-400">
          Best value
        </Badge>
      )}

      <p className="font-semibold text-lg">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>

      <p className="mt-3 text-sm text-muted-foreground">
        {coins} coins
      </p>
      <p className="text-2xl font-bold text-emerald-400">
        +{points} pts
      </p>

      <Button
        className="mt-4 w-full"
        disabled={disabled}
        onClick={onBuy}
      >
        {disabled ? "Insufficient coins" : "Convert"}
      </Button>
    </Card>
  );
}
