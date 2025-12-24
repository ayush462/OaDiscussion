import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Bookmark, Save } from "lucide-react";

import ExperienceCard from "../components/ExperienceCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getCompanyKey } from "../services/normalize";

export default function Bookmarks() {
  const [data, setData] = useState([]);
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bookmarkRes, followRes] = await Promise.all([
          axios.get(
            "http://localhost:5000/api/experience/bookmarks/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            "http://localhost:5000/api/users/followed/companies",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setData(bookmarkRes.data || []);
        setFollowedCompanies(
          (followRes.data || []).map(getCompanyKey)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* ================= HANDLERS ================= */

  const handleUnbookmark = (id) => {
    setData((prev) => prev.filter((exp) => exp._id !== id));
  };

  const handleFollowChange = (company, followed) => {
    const key = getCompanyKey(company);

    setFollowedCompanies((prev) =>
      followed
        ? [...new Set([...prev, key])]
        : prev.filter((c) => c !== key)
    );
  };

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

  if (!data.length) {
    return (
      <Card className="p-10 text-center bg-white/5 border-white/10">
        <Bookmark className="mx-auto h-10 w-10 text-blue-400 mb-3" />
        <p className="text-gray-400 font-medium">
          No saved experiences yet
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Bookmark OA experiences to revisit later
        </p>
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
        <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30">
          <Save className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bookmarked OA Experiences
          </h1>
          <p className="text-sm text-gray-400">
            Your saved interview experiences for later review
          </p>
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((exp) => {
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
                hover:shadow-[0_0_40px_-12px_rgba(59,130,246,0.35)]
              "
            >
              {/* SAVED BADGE */}
              <div className="absolute -top-3 -right-3 z-10">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">
                  <Bookmark className="h-3 w-3 mr-1" />
                  SAVED
                </Badge>
              </div>

              <ExperienceCard
                exp={exp}
                variant="compact"
                isFollowing={isFollowing}
                onFollowChange={handleFollowChange}
                onUnbookmark={handleUnbookmark}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
