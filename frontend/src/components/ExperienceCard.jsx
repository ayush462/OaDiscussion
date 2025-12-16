import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Building2,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Flame,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import UpvoteButton from "./UpvoteButton";
import CommentSection from "./CommentSection";

export default function ExperienceCard({ exp }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const email = exp.author?.email || "Unknown User";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="perspective-1000"
    >
      <Card
        className="
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br from-[#0b0f1a] via-[#111827] to-[#020617]
          border border-white/10
          shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]
        "
      >
        {/* SUBTLE GLOW */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition" />

        {/* HEADER */}
        <CardHeader className="relative z-10 space-y-4 pb-2">
          {/* USER */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-indigo-500/40">
              <AvatarFallback className="bg-indigo-600 text-white font-bold">
                {email[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">
                {email}
              </p>
              <p className="text-xs text-gray-400">
                Shared interview experience
              </p>
            </div>
          </div>

          {/* COMPANY + ROLE (STRONG VISUAL BLOCK) */}
          <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white tracking-wide">
              <Building2 className="h-4 w-4 text-indigo-400" />
              {exp.company}
            </h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
              <Briefcase className="h-4 w-4" />
              {exp.role}
            </p>
          </div>

          {/* META TAGS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* OA PLATFORM */}
            {exp.oaPlatform && (
              <span className="
                inline-flex items-center gap-1
                rounded-full px-3 py-1 text-xs font-medium
                bg-gradient-to-r from-indigo-600/30 to-purple-600/30
                text-indigo-300 border border-indigo-500/30
                shadow-[0_0_12px_rgba(99,102,241,0.25)]
              ">
                {exp.oaPlatform}
              </span>
            )}

            {/* DIFFICULTY */}
            {exp.difficulty && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                ${
                  exp.difficulty === "Easy"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : exp.difficulty === "Medium"
                    ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
                    : "bg-red-500/15 text-red-300 border border-red-500/30"
                }`}
              >
                {exp.difficulty}
              </span>
            )}
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="relative z-10 space-y-4 pt-2">
          {/* EXPERIENCE TEXT */}
          <motion.p
            layout
            className={`text-sm leading-relaxed text-gray-300 ${
              !expanded && "line-clamp-4"
            }`}
          >
            {exp.experienceText}
          </motion.p>

          {/* TOPICS */}
          {exp.topics?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Topics Covered
              </p>

              <div className="flex flex-wrap gap-2">
                {exp.topics.map((topic) => (
                  <span
                    key={topic}
                    className="
                      inline-flex items-center gap-1
                      rounded-lg px-2.5 py-1 text-xs
                      bg-white/5 text-gray-300
                      border border-white/10
                      hover:bg-white/10 transition
                    "
                  >
                    <Layers className="h-3 w-3 text-indigo-400" />
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BAR */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <UpvoteButton
                id={exp._id}
                count={exp.upvotes.length}
                icon={<Flame className="h-4 w-4 text-orange-400" />}
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-gray-300 hover:text-white"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {exp.commentCount || 0}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-white"
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                <CommentSection experienceId={exp._id} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
