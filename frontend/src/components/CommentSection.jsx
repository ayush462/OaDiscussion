import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Heart,
  MessageCircle,
  Trash2,
  Send,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function CommentSection({
  experienceId,
  onCommentCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");

  /**
   * replyTarget = {
   *   parentId: string,
   *   replyingTo: string (email)
   * }
   */
  const [replyTarget, setReplyTarget] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  /* ================= FETCH ================= */
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/comments/${experienceId}`)
      .then((res) => {
        const mapped = res.data.map(mapComment);
        setComments(mapped);
        onCommentCountChange?.(countAll(mapped));
      });
  }, [experienceId]);

  /* ================= HELPERS ================= */
  const mapComment = (c) => ({
    ...c,
    likedByMe: c.likes?.includes(userId),
    replies: (c.replies || []).map((r) => ({
      ...r,
      likedByMe: r.likes?.includes(userId),
    })),
  });

  const countAll = (list) =>
    list.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  /* ================= ADD COMMENT ================= */
  const addComment = async () => {
    if (!text.trim()) return;

    const tempId = `tmp-${Date.now()}`;

    const optimistic = {
      _id: tempId,
      text,
      author: { _id: userId, email, role },
      likes: [],
      likeCount: 0,
      likedByMe: false,
      replies: [],
    };

    setComments((p) => [optimistic, ...p]);
    onCommentCountChange?.((c) => c + 1);
    setText("");

    const res = await axios.post(
      `http://localhost:5000/api/comments/${experienceId}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComments((p) =>
      p.map((c) => (c._id === tempId ? mapComment(res.data) : c))
    );
  };

  /* ================= ADD REPLY (REPLY → REPLY → REPLY) ================= */
  const addReply = async () => {
    if (!replyText.trim() || !replyTarget) return;

    const { parentId } = replyTarget;
    const tempId = `tmp-${Date.now()}`;

    setComments((prev) =>
      prev.map((c) =>
        c._id === parentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  _id: tempId,
                  text: replyText,
                  author: { _id: userId, email, role },
                  likes: [],
                  likeCount: 0,
                  likedByMe: false,
                },
              ],
            }
          : c
      )
    );

    onCommentCountChange?.((c) => c + 1);
    setReplyText("");
    setReplyTarget(null);

    const res = await axios.post(
      `http://localhost:5000/api/comments/${experienceId}`,
      {
        text: replyText,
        parentComment: parentId, // ALWAYS parent
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComments((prev) =>
      prev.map((c) =>
        c._id === parentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r._id === tempId ? mapComment(res.data) : r
              ),
            }
          : c
      )
    );
  };

  /* ================= LIKE ================= */
  const toggleLike = async (id, parentId = null) => {
    setComments((prev) =>
      prev.map((c) => {
        if (parentId && c._id === parentId) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r._id === id
                ? {
                    ...r,
                    likedByMe: !r.likedByMe,
                    likeCount: r.likedByMe
                      ? r.likeCount - 1
                      : r.likeCount + 1,
                  }
                : r
            ),
          };
        }

        if (c._id === id) {
          return {
            ...c,
            likedByMe: !c.likedByMe,
            likeCount: c.likedByMe
              ? c.likeCount - 1
              : c.likeCount + 1,
          };
        }

        return c;
      })
    );

    await axios.post(
      `http://localhost:5000/api/comments/like/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  /* ================= DELETE ================= */
  const deleteComment = async (id, parentId = null) => {
    setComments((prev) =>
      parentId
        ? prev.map((c) =>
            c._id === parentId
              ? {
                  ...c,
                  replies: c.replies.filter((r) => r._id !== id),
                }
              : c
          )
        : prev.filter((c) => c._id !== id)
    );

    onCommentCountChange?.((c) => Math.max(0, c - 1));

    await axios.delete(
      `http://localhost:5000/api/comments/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-4 mt-4">
      {/* ADD COMMENT */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button size="icon" onClick={addComment}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {comments.map((c) => (
          <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-3 bg-muted/40">
              <div className="flex gap-2">
                <UserCircle className="h-6 w-6" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {c.author.email}
                  </p>
                  <p className="text-sm">{c.text}</p>

                  <div className="flex gap-4 mt-2 text-xs">
                    <button
                      onClick={() => toggleLike(c._id)}
                      className={c.likedByMe ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 inline ${
                          c.likedByMe && "fill-red-500"
                        }`}
                      />{" "}
                      {c.likeCount}
                    </button>

                    <button
                      onClick={() =>
                        setReplyTarget({
                          parentId: c._id,
                          replyingTo: c.author.email,
                        })
                      }
                    >
                      Reply
                    </button>

                    {(c.author._id === userId || role === "admin") && (
                      <Trash2
                        className="h-4 w-4 text-destructive cursor-pointer"
                        onClick={() => deleteComment(c._id)}
                      />
                    )}
                  </div>

                  {/* REPLY INPUT */}
                  {replyTarget?.parentId === c._id && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder={`Replying to @${replyTarget.replyingTo}`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <Button size="icon" onClick={addReply}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* REPLIES */}
                  <div className="ml-6 mt-3 space-y-2">
                    {c.replies.map((r) => (
                      <div key={r._id} className="flex gap-2">
                        <UserCircle className="h-5 w-5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            {r.author.email}
                          </p>
                          <p className="text-sm">{r.text}</p>

                          <div className="flex gap-3 text-xs">
                            <button
                              onClick={() => toggleLike(r._id, c._id)}
                              className={r.likedByMe ? "text-red-500" : ""}
                            >
                              <Heart
                                className={`h-3 w-3 inline ${
                                  r.likedByMe && "fill-red-500"
                                }`}
                              />{" "}
                              {r.likeCount}
                            </button>

                            <button
                              onClick={() =>
                                setReplyTarget({
                                  parentId: c._id,
                                  replyingTo: r.author.email,
                                })
                              }
                            >
                              Reply
                            </button>

                            {(r.author._id === userId ||
                              role === "admin") && (
                              <Trash2
                                className="h-3 w-3 text-destructive cursor-pointer"
                                onClick={() =>
                                  deleteComment(r._id, c._id)
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
