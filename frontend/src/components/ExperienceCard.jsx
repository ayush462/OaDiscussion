import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { formatDateTime } from "@/services/dateFormater";
import PlainAiText from "./PlainAiText";
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
  Bookmark,
  Bell,
  BellOff,
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
import { getCompanyKey } from "../services/normalize";

/* ========================================================= */

export default function ExperienceCard({
  exp,
  variant ="full",
  isFollowing,
  onFollowChange,
  onUnbookmark,
}) {
  const isCompact = variant === "compact";
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const [commentCount, setCommentCount] = useState(0);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ================= COMPANY NORMALIZATION ================= */
  function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  // fallback to exact date
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


  // 🔥 BACKEND-IDENTICAL NORMALIZATION
  const companyKey = getCompanyKey(exp.company);

  const companyData = COMPANY_DATA.find(
    (c) => getCompanyKey(c.key) === companyKey
  );
  const companyLogo = companyData?.logo;

  /* ================= BOOKMARK ================= */

  const [bookmarked, setBookmarked] = useState(exp.isBookmarked);

  useEffect(() => {
    setBookmarked(exp.isBookmarked);
  }, [exp.isBookmarked]);

  /* ================= COMMENTS COUNT ================= */
  

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/comments/${exp._id}`)
      .then((res) => {
        const total = res.data.reduce(
          (sum, c) => sum + 1 + (c.replies?.length || 0),
          0
        );
        setCommentCount(total);
      })
      .catch(() => {});
  }, [exp._id]);

  /* ================= FOLLOW / UNFOLLOW ================= */

  const toggleFollowCompany = async () => {
    if (!token) {
      toast.error("Login to follow companies");
      return;
    }

    try {
      const url = isFollowing
        ? "http://localhost:5000/api/users/unfollow/company"
        : "http://localhost:5000/api/users/follow/company";

      await axios.post(
        url,
        { company: companyKey }, // ✅ SAME AS BACKEND
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onFollowChange(companyKey, !isFollowing);

      toast.success(
        !isFollowing
          ? `Following ${exp.company}`
          : `Unfollowed ${exp.company}`
      );
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* ================= BOOKMARK ================= */

  const toggleBookmark = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/experience/${exp._id}/bookmark`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookmarked(res.data.bookmarked);

      if (!res.data.bookmarked && onUnbookmark) {
        onUnbookmark(exp._id);
      }
    } catch {
      toast.error("Bookmark failed");
    }
  };

  /* ================= DIFFICULTY UI ================= */

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

  /* ================= AUTHOR ================= */

  const authorEmail = exp?.isAnonymous
    ? "Anonymous"
    : exp?.author?.email || "Unknown User";

  const isVerified =
    !exp?.isAnonymous && Number(exp?.author?.points || 0) >= 120;

  const avatarLetter = authorEmail?.charAt(0)?.toUpperCase() || "?";

  /* ================= PATTERN FORMAT ================= */

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

          {/* ================= HEADER ================= */}
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
                  <Link
                    to={`/user/${exp.author?._id}`}
                    className="text-sm font-semibold text-white break-all hover:underline"
                  >
                    {authorEmail}
                  </Link>

                  {isVerified && (
                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                  )}
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-2">
  Shared interview experience
 {exp.createdAt && (
  <p className="text-[11px] text-muted-foreground ">
    {formatDateTime(exp.createdAt)}
  </p>
)}

</p>

              </div>
            </div>

            {/* COMPANY */}
            <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
              <div className="flex items-center justify-between gap-3">
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

                <div className="flex flex-col gap-2 shrink-0">
  <Button
    size="sm"
    variant={isFollowing ? "secondary" : "outline"}
    onClick={toggleFollowCompany}
    className="flex items-center gap-1"
  >
    {isFollowing ? (
      <>
        <BellOff className="h-4 w-4" />
        Following
      </>
    ) : (
      <>
        <Bell className="h-4 w-4" />
        Follow
      </>
    )}
  </Button>

  {/* ✅ VIEW DETAILS (ALWAYS VISIBLE) */}
  <Link to={`/app/experience/${exp._id}`} className="w-full">
    <Button
      size="sm"
      variant="ghost"
      className="
        w-full
        text-emerald-400
        hover:text-emerald-300
        hover:bg-emerald-500/10
        border border-emerald-500/20
      "
    >
      View Details →
    </Button>
  </Link>
</div>

                
              </div>

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

          {/* ================= CONTENT ================= */}
          <CardContent className="space-y-4 overflow-hidden">

            {/* DESCRIPTION */}
          {!isCompact && (
  <div
    className={`
      relative overflow-hidden transition-[max-height] duration-300
      ${expanded ? "max-h-[2000px]" : "max-h-[160px]"}
    `}
  >
    <PlainAiText text={exp.experienceText} />

    {!expanded && (
      <div className="
        pointer-events-none
        absolute bottom-0 left-0 right-0
        h-10
        bg-gradient-to-t
        from-[#020617]
        to-transparent
      " />
    )}
  </div>
)}




            {/* TOPICS */}
           {!isCompact && exp.topics?.length > 0 && (   // ⭐ ADD THIS
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
           {!isCompact && exp.questionPatterns?.length > 0 && (   // ⭐ ADD THIS
  <div>
    <p className="text-xs uppercase text-gray-500 mb-2">
      Question Patterns
    </p>
    <div className="flex flex-wrap gap-2">
      {exp.questionPatterns.map((p) => (
        <span
          key={p}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded break-all"
        >
          <Puzzle className="h-3 w-3" />
          {formatPattern(p)}
        </span>
      ))}
    </div>
  </div>
)}


            {/* ACTION BAR */}
           {!isCompact && (                                     // ⭐ ADD THIS
  <>
    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
      <UpvoteButton
        id={exp._id}
        count={exp.upvoteCount ?? exp.upvotes.length}
        isUpvotedByMe={exp.isUpvotedByMe}
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
        variant="ghost"
        size="sm"
        onClick={toggleBookmark}
        className="flex items-center gap-1"
      >
        <Bookmark
          className={`h-4 w-4 ${
            bookmarked
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-400"
          }`}
        />
        <span className="text-xs">
          {bookmarked ? "Saved" : "Save"}
        </span>
      </Button>

      <Button variant="outline" size="sm" onClick={generateSummary}>
        <Sparkles className="h-4 w-4 mr-1" />
        Summary
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
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
  </>
)}

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
            <p className="text-sm text-gray-400">Generating summary…</p>
          ) : (
            <PlainAiText text={summary} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
