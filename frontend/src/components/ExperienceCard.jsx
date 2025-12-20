import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import {
  Building2,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Flame,
  BadgeCheck,
  Sparkles,
  Monitor,
  Gauge,
  IndianRupee,
  Puzzle,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import UpvoteButton from "./UpvoteButton";
import CommentSection from "./CommentSection";
import FormattedText from "./Formated";

import { COMPANY_DATA } from "../services/data";
import { normalizeCompanyName } from "../services/normalize";

export default function ExperienceCard({ exp }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // 🔥 LOCAL COMMENT COUNT (smooth UI)
  const [commentCount, setCommentCount] = useState(
    exp.commentCount || 0
  );

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  /* ================= UTILS ================= */

  const difficultyStyles = (difficulty = "") => {
    const level = difficulty.toLowerCase();
    if (level === "easy")
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
    if (level === "medium")
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-300";
    if (level === "hard")
      return "bg-red-500/10 border-red-500/20 text-red-300";
    return "bg-gray-500/10 border-gray-500/20 text-gray-300";
  };

  const authorEmail = exp?.isAnonymous
    ? "Anonymous"
    : exp?.author?.email || "Unknown User";

  const isVerified =
    !exp?.isAnonymous && Number(exp?.author?.points || 0) > 40;

  const avatarLetter = authorEmail?.charAt(0)?.toUpperCase() || "?";

  const normalizedCompany = normalizeCompanyName(exp.company || "");
  const companyData = COMPANY_DATA.find(
    (c) => c.key === normalizedCompany
  );
  const companyLogo = companyData?.logo;

  const formatPattern = (p) =>
    p
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  /* ================= AI SUMMARY ================= */

  const generateSummary = async () => {
    try {
      setSummaryOpen(true);
      setSummaryLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/ai/summarize",
        {
          text: exp.experienceText,
          topics: exp.topics,
          difficulty: exp.difficulty,
          questionPatterns: exp.questionPatterns,
        }
      );

      setSummary(res.data.summary);
    } catch {
      setSummary("❌ Failed to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden transition-transform sm:hover:scale-[1.02]"
      >
        <Card className="rounded-2xl bg-gradient-to-br from-[#0b0f1a] via-[#111827] to-[#020617] border border-white/10 shadow-xl overflow-hidden">
          <CardHeader className="space-y-4 pb-2">
            {/* USER */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-indigo-500/40">
                <AvatarFallback className="bg-indigo-600 text-white font-bold">
                  {avatarLetter}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <p className="text-sm font-semibold text-white break-all">
                    {authorEmail}
                  </p>
                  {isVerified && (
                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Shared interview experience
                </p>
              </div>
            </div>

            {/* COMPANY */}
            <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
              <h3 className="flex items-center gap-3 text-lg font-bold text-white break-words">
                <div className="flex items-center justify-center h-9 w-9 shrink-0">
                  {!logoError && companyLogo ? (
                    <img
                      src={companyLogo}
                      alt={exp.company}
                      className="h-8 w-8 object-contain bg-white rounded-md p-1.5"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <Building2 className="h-7 w-7 text-indigo-400" />
                  )}
                </div>
                {exp.company}
              </h3>

              <p className="mt-1 flex items-center gap-2 text-sm text-gray-400 break-words">
                <Briefcase className="h-4 w-4 ml-2" />
                {exp.role}
              </p>

              {/* META */}
              <div className="mt-3 flex flex-wrap gap-2">
                {exp.oaPlatform && (
                  <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    <Monitor className="h-3 w-3" />
                    {exp.oaPlatform}
                  </span>
                )}

                {exp.difficulty && (
                  <span
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border ${difficultyStyles(
                      exp.difficulty
                    )}`}
                  >
                    <Gauge className="h-3 w-3" />
                    {exp.difficulty}
                  </span>
                )}

                {typeof exp.salaryLPA === "number" && (
                  <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
                    <IndianRupee className="h-3 w-3" />
                    {exp.salaryLPA} LPA
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 overflow-hidden">
            {/* DESCRIPTION */}
            <div
              className={`prose prose-invert max-w-none break-words ${
                !expanded ? "line-clamp-5" : ""
              }`}
            >
              <FormattedText content={exp.experienceText} />
            </div>

            {/* TOPICS */}
            {exp.topics?.length > 0 && (
              <div>
                <p className="text-xs uppercase text-gray-500 mb-2">
                  Topics Covered
                </p>
                <div className="flex flex-wrap gap-2">
                  {exp.topics.map((topic) => (
                    <span
                      key={topic}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded break-all"
                    >
                      <Layers className="h-3 w-3 text-indigo-400" />
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* QUESTION PATTERNS */}
            {exp.questionPatterns?.length > 0 && (
              <div>
                <p className="text-xs uppercase text-gray-500 mb-2">
                  Question Patterns
                </p>
                <div className="flex flex-wrap gap-2">
                  {exp.questionPatterns.map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/10 border border-purple-500/20 rounded text-purple-300 break-all"
                    >
                      <Puzzle className="h-3 w-3" />
                      {formatPattern(p)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BAR */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <UpvoteButton
                  id={exp._id}
                  count={exp.upvotes.length}
                  icon={<Flame className="h-4 w-4 text-orange-400" />}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {commentCount}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSummary}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Summary
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="self-start sm:self-auto"
              >
                {expanded ? "Collapse" : "Read more"}
                {expanded ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>

            {/* COMMENTS */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <CommentSection
                    experienceId={exp._id}
                    onCommentCountChange={setCommentCount}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* SUMMARY MODAL */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Summary</DialogTitle>
          </DialogHeader>

          {summaryLoading ? (
            <p className="text-sm text-gray-400">
              Generating summary…
            </p>
          ) : (
            <FormattedText content={summary} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
