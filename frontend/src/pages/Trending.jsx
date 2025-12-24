// Trending.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Crown } from "lucide-react";

import ExperienceCard from "../components/ExperienceCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getCompanyKey } from "../services/normalize";

/* ================= TRENDING SCORE ================= */

const getTrendingScore = (exp) => {
  const upvotes = exp.upvotes?.length || 0;
  const comments = exp.commentCount || 0;
  const unlocks = exp.unlockCount || 0;

  const createdAt = new Date(exp.createdAt);
  const hoursAgo = (Date.now() - createdAt.getTime()) / 36e5;

  const freshnessBoost =
    hoursAgo < 6 ? 15 :
    hoursAgo < 24 ? 10 :
    hoursAgo < 72 ? 5 : 0;

  return upvotes * 3 + comments * 2 + unlocks * 4 + freshnessBoost;
};

export default function Trending() {
  const [data, setData] = useState([]);
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendRes, followRes] = await Promise.all([
          axios.get("http://localhost:5000/api/experience/trending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          token
            ? axios.get("http://localhost:5000/api/users/followed/companies", {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: [] }),
        ]);

        setData(trendRes.data || []);
        setFollowedCompanies((followRes.data || []).map(getCompanyKey));
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const sortedTrending = useMemo(() => {
    return [...data]
      .map((exp) => ({
        ...exp,
        trendingScore: getTrendingScore(exp),
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 6);
  }, [data]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            className="h-48 rounded-xl bg-white/5"
          />
        ))}
      </div>
    );
  }

  /* ================= EMPTY ================= */

  if (!sortedTrending.length) {
    return (
      <Card className="p-10 text-center bg-white/5 border-white/10">
        <Flame className="mx-auto h-10 w-10 text-orange-400 mb-3" />
        <p className="text-gray-400">No trending experiences yet</p>
      </Card>
    );
  }

  /* ================= PAGE ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30">
          <Flame className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Trending OA Experiences
          </h1>
          <p className="text-sm text-gray-400">
            Most active & discussed interview experiences
          </p>
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTrending.map((exp, index) => {
          const score = exp.trendingScore;

          const isHot = score >= 40;
          const isRising = score >= 25;
          const isNew = score < 25;

          const isFollowing = followedCompanies.includes(
            getCompanyKey(exp.company)
          );

          return (
            <div
              key={exp._id}
              className="
                relative
                transition
                hover:scale-[1.02]
                hover:shadow-[0_0_40px_-12px_rgba(255,140,0,0.35)]
              "
            >
              {/* ================= BADGES ================= */}
              <div className="absolute -top-3 -right-3 z-20 flex flex-col gap-1">
                {index < 3 && (
                  <Badge
                    className="
                      bg-yellow-500/20 text-yellow-300 border-yellow-500/40
                      flex items-center gap-1
                    "
                  >
                    <Crown className="h-3 w-3" />
                    #{index + 1}
                  </Badge>
                )}

                {isHot && (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40">
                    🔥 HOT
                  </Badge>
                )}

                {!isHot && isRising && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    RISING
                  </Badge>
                )}

                {isNew && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                    NEW
                  </Badge>
                )}
              </div>

              {/* ================= CARD ================= */}
              <ExperienceCard
                exp={exp}
                variant="compact"
                isFollowing={isFollowing}
                onFollowChange={() => {}}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
