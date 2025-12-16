import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";

import ExperienceCard from "../components/ExperienceCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Feed() {
  const [data, setData] = useState([]);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/experience", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setData(res.data.data || []);
        setLocked(res.data.locked);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      {/* 🔒 Locked Banner */}
      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="relative border border-primary/30 bg-card">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5" />
              <div className="relative flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Feed Locked
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Post one experience to unlock the full feed
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={() => (window.location.href = "/app/forum")}
                >
                  Share
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⏳ Loading */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="h-40 animate-pulse border border-border bg-card/70"
            />
          ))}
        </div>
      )}

      {/* ✨ Empty State */}
      {!loading && data.length === 0 && (
        <Card className="flex flex-col items-center gap-4 border border-border bg-card p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            No experiences yet
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Be the first one to share your OA experience and help others 🚀
          </p>
          <Button
            onClick={() => (window.location.href = "/app/forum")}
          >
            Share Experience
          </Button>
        </Card>
      )}

      {/* 📰 Feed */}
      <AnimatePresence>
        {data.map((exp, index) => (
          <motion.div
            key={exp._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <ExperienceCard exp={exp} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
