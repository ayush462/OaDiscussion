import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  BadgeCheck,
  Trophy,
  Building2,
  Coins,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/users/${id}/public`)
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, [id]);

  if (!profile) return null;

  const tags = profile.companyTags || [];
  const loopedTags = [...tags, ...tags];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="max-w-4xl mx-auto p-4 space-y-8"
    >
      {/* ================= HEADER ================= */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-background via-background to-emerald-950/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-emerald-500/40">
              <AvatarFallback className="text-lg font-bold">
                {profile.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  {profile.username}
                </h2>

                {profile.points >= 120 && (
                  <BadgeCheck className="h-5 w-5 text-emerald-400 drop-shadow" />
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Public contributor profile
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 p-4 bg-background/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-emerald-400" />
              Reputation
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {profile.points}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                pts
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-4 bg-background/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4 text-yellow-400" />
              Coins
            </div>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {profile.coins ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-4 bg-background/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 text-sky-400" />
              OA Experiences
            </div>
            <p className="text-2xl font-bold mt-1">
              {profile.totalPosts}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ================= CONTRIBUTIONS ================= */}
      <Card className="border-white/10 overflow-hidden">
        <CardHeader>
          <h3 className="font-semibold text-lg">
            Company Contributions
          </h3>
        </CardHeader>

        <Separator />

        <CardContent className="relative overflow-hidden py-4">
          {tags.length > 0 ? (
            <motion.div
              className="flex gap-3 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: Math.max(20, tags.length * 3),
              }}
              whileHover={{ animationPlayState: "paused" }}
            >
              {loopedTags.map((c, i) => (
                <Badge
                  key={`${c.company}-${c.tag}-${i}`}
                  variant="secondary"
                  className="
                    px-3 py-1
                    bg-muted/50
                    whitespace-nowrap
                    hover:bg-muted
                    transition
                  "
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
    </motion.div>
  );
}
