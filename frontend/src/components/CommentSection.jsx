import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Send, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CommentSection({ experienceId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  console.log("User ID:", userId);


  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/comments/${experienceId}`)
      .then((res) => setComments(res.data))
      .catch(() => {});
  }, [experienceId]);

  const addComment = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${experienceId}`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const deleteComment = async (commentId) => {
  try {
    await axios.delete(
      `http://localhost:5000/api/comments/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // remove from UI instantly
    setComments((prev) =>
      prev.filter((c) => c._id !== commentId)
    );
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="mt-4 space-y-3">
      {/* Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={addComment}
          disabled={loading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments */}
     <AnimatePresence>
  {comments.map((c) => {
   const isOwner = c.author?._id?.toString() === userId;

    const isAdmin = c.author?.role === "admin";
      console.log("COMMENT DEBUG", {
    commentId: c._id,
    author: c.author,
    authorType: typeof c.author,
    authorId: c.author?._id,
    loggedInUserId: userId,
  });


    return (
      <motion.div
        key={c._id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card className="p-3 border border-white/10 bg-muted/40">
          <div className="flex items-start gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />

            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {c.isAnonymous ? "Anonymous" : c.author?.email}
                  </span>

                  {isAdmin && (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </div>

                {/* 🗑️ DELETE BUTTON */}
                {(isOwner || isAdmin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive"
                    onClick={() => deleteComment(c._id)}
                  >
                    Delete
                  </Button>
                )}
              </div>

              {/* Comment text */}
              <p className="text-sm mt-1">{c.text}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  })}
</AnimatePresence>

    </div>
  );
}
