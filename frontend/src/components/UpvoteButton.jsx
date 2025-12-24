import axios from "axios";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UpvoteButton({
  id,
  count,
  isUpvotedByMe,
}) {
  const token = localStorage.getItem("token");

  const [upvoted, setUpvoted] = useState(isUpvotedByMe);
  const [upvoteCount, setUpvoteCount] = useState(count);
  const [loading, setLoading] = useState(false);

  /* 🔁 keep state in sync with backend */
  useEffect(() => {
    setUpvoted(isUpvotedByMe);
    setUpvoteCount(count);
  }, [isUpvotedByMe, count]);

  const upvote = async () => {
    if (!token) {
      toast.error("Login to like");
      return;
    }

    if (upvoted || loading) {
      toast.info("You already liked this");
      return;
    }

    setLoading(true);

    // ⚡ optimistic UI
    setUpvoted(true);
    setUpvoteCount((c) => c + 1);

    try {
      await axios.post(
        `https://oadiscussion.onrender.com/api/experience/${id}/upvote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Liked");
    } catch (err) {
      // 🔄 rollback
      setUpvoted(false);
      setUpvoteCount((c) => c - 1);

      const msg =
        err?.response?.data?.message ||
        "Like failed";

      // 🎯 specific backend messages
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={upvote}
        className={`flex items-center gap-1 transition-colors ${
          upvoted
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ArrowUp
          className={`h-4 w-4 ${
            upvoted ? "text-emerald-300" : ""
          }`}
        />
        <span className="text-sm font-medium">
          {upvoteCount}
        </span>
      </Button>
    </motion.div>
  );
}
