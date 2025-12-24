import { useState } from "react";
import axios from "axios";
import {
  BarChart3,
  Layers,
  ArrowLeftRight,
  Gauge,
  Brain,
  Trophy,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import FormattedText from "@/components/Formated";
import { motion } from "framer-motion";

/* ================= CONFIG ================= */

const DIFFICULTY_COLORS = {
  EASY: "bg-emerald-500/15 text-emerald-400",
  MEDIUM: "bg-yellow-500/15 text-yellow-400",
  HARD: "bg-red-500/15 text-red-400",
};

/* ================= HELPERS ================= */

const getDifficultyScore = (breakdown = {}) => {
  const easy = breakdown.EASY || 0;
  const medium = breakdown.MEDIUM || 0;
  const hard = breakdown.HARD || 0;

  return hard * 3 + medium * 2 + easy;
};

/* ================= COMPONENT ================= */

export default function CompareCompanies() {
  const [companyA, setCompanyA] = useState("");
  const [companyB, setCompanyB] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ================= COMPARE ================= */

  const compare = async () => {
    if (!companyA || !companyB) return;

    try {
      setLoading(true);
      setAiSummary("");

      const res = await axios.get(
        "http://localhost:5000/api/users/compare",
        {
          params: { companyA, companyB },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResult(res.data);
    } catch (err) {
      console.error("COMPARE FAILED", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= AI SUMMARY ================= */

  const getAiSummary = async () => {
    if (!result?.comparison) return;

    try {
      setAiLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/ai/compare-summary",
        {
          comparison: result.comparison,
          companyA: companyA.trim().toUpperCase(),
          companyB: companyB.trim().toUpperCase(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAiSummary(res.data.summary);
    } catch (err) {
      console.error("AI SUMMARY FAILED", err);
      setAiSummary("AI summary unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  /* ================= DERIVED ================= */

  const comparison = result?.comparison || {};
  const companies = Object.entries(comparison);

  let harderCompany = null;
  let easierCompany = null;

  if (companies.length === 2) {
    const [a, b] = companies;

    const scoreA = getDifficultyScore(a[1].difficultyBreakdown);
    const scoreB = getDifficultyScore(b[1].difficultyBreakdown);

    if (scoreA > scoreB) {
      harderCompany = a[0];
      easierCompany = b[0];
    } else if (scoreB > scoreA) {
      harderCompany = b[0];
      easierCompany = a[0];
    }
  }

  /* ================= RENDER ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="max-w-5xl mx-auto p-4 space-y-8"
    >
      {/* ================= INPUT ================= */}
      <Card className="border-white/10 bg-gradient-to-br from-background via-background to-sky-950/20">
        <CardHeader>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-sky-400" />
            Compare Companies
          </h2>
        </CardHeader>

        <CardContent className="grid sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-center">
          <Input
            placeholder="Company A (AMAZON)"
            value={companyA}
            onChange={(e) => setCompanyA(e.target.value.toUpperCase())}
            className="text-center"
          />

          <span className="text-muted-foreground font-semibold hidden sm:block">
            VS
          </span>

          <Input
            placeholder="Company B (GOOGLE)"
            value={companyB}
            onChange={(e) => setCompanyB(e.target.value.toUpperCase())}
            className="text-center"
          />

          <Button onClick={compare} disabled={loading}>
            {loading ? "Comparing..." : "Compare"}
          </Button>
        </CardContent>
      </Card>

      {/* ================= HARDER COMPANY ================= */}
      {harderCompany && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-red-400" />
              Harder OA Overall
            </h3>
          </CardHeader>

          <CardContent className="text-sm space-y-1">
            <p>
              <span className="text-red-400 font-semibold">
                {harderCompany}
              </span>{" "}
              has a tougher OA compared to{" "}
              <span className="text-emerald-400 font-semibold">
                {easierCompany}
              </span>.
            </p>
            <p className="text-muted-foreground">
              Based on higher weightage of HARD and MEDIUM questions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ================= AI SUMMARY ================= */}
      {Object.keys(comparison).length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={getAiSummary}
            disabled={aiLoading}
          >
            <Brain className="h-4 w-4 mr-1" />
            {aiLoading ? "Analyzing..." : "AI Insight"}
          </Button>
        </div>
      )}

      {aiSummary && (
        <Card className="border-sky-500/30 bg-sky-500/5">
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-sky-400" />
              AI Insight
            </h3>
          </CardHeader>
          <CardContent>
            <FormattedText content={aiSummary} />
          </CardContent>
        </Card>
      )}

      {/* ================= RESULT ================= */}
      {Object.keys(comparison).length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {companies.map(([company, data]) => (
            <Card key={company} className="border-white/10">
              <CardHeader className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{company}</h3>

                {company === harderCompany && (
                  <Badge className="bg-red-500/20 text-red-400">
                    Harder OA
                  </Badge>
                )}

                {company === easierCompany && (
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    Easier
                  </Badge>
                )}
              </CardHeader>

              <Separator />

              <CardContent className="space-y-5 pt-4">
                {/* TOTAL */}
                <div className="rounded-xl border border-white/10 p-4 bg-background/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers className="h-4 w-4 text-sky-400" />
                    Total Experiences
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {data.totalExperiences}
                  </p>
                </div>

                {/* DIFFICULTY */}
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-purple-400" />
                    Difficulty Distribution
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {["EASY", "MEDIUM", "HARD"].map((level) => (
                      <Badge
                        key={level}
                        className={`${DIFFICULTY_COLORS[level]} px-3 py-1`}
                      >
                        {level}
                        <span className="ml-1 font-semibold">
                          {data.difficultyBreakdown?.[level] || 0}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* TOPICS */}
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    Top Topics
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {data.topTopics?.map((t) => (
                      <Badge key={t.topic} variant="secondary">
                        {t.topic}
                        <span className="ml-1 text-emerald-400">
                          {t.count}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
