import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import ExperienceCard from "../components/ExperienceCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  Building2,
} from "lucide-react";

import { getCompanyKey } from "../services/normalize";

export default function ExperienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exp, setExp] = useState(null);
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchAll = async () => {
      try {
        const [expRes, followRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/experience/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            "http://localhost:5000/api/users/followed/companies",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setExp(expRes.data);
        setFollowedCompanies(
          (followRes.data || []).map(getCompanyKey)
        );
      } catch {
        setExp(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  /* ================= LOADER ================= */

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto max-w-4xl space-y-4 p-4"
      >
        <Card className="h-28 animate-pulse bg-white/5 border-white/10" />
        <Card className="h-80 animate-pulse bg-white/5 border-white/10" />
      </motion.div>
    );
  }

  if (!exp) {
    return (
      <p className="text-center text-gray-400">
        Experience not found
      </p>
    );
  }

  const companyKey = getCompanyKey(exp.company);
  const isFollowing = followedCompanies.includes(companyKey);

  /* ================= FOLLOW HANDLER ================= */

  const handleFollowChange = (_, followed) => {
    setFollowedCompanies((prev) =>
      followed
        ? [...new Set([...prev, companyKey])]
        : prev.filter((c) => c !== companyKey)
    );
  };

  /* ================= PAGE ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mx-auto max-w-4xl space-y-6 p-4"
    >
      {/* ================= DETAIL HEADER ================= */}
      <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-indigo-300">
              Experience Detail
            </p>

            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-indigo-400" />
              {exp.company}
            </h1>

            <p className="text-sm text-gray-400">
              {exp.role} · Full interview breakdown
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
      </Card>

      {/* ================= EXPERIENCE CARD ================= */}
      <ExperienceCard
        exp={exp}
        isFollowing={isFollowing}
        onFollowChange={handleFollowChange}
      />
    </motion.div>
  );
}
