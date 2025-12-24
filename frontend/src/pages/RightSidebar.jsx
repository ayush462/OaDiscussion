import { useEffect, useState, memo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Brain,
  Puzzle,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ========================================================= */

const RightSidebar = memo(function RightSidebar({ mobile = false }) {
  const [insights, setInsights] = useState(null);
  const [aiTip, setAiTip] = useState("");

  /* ================= FETCH DATA (RUNS ONCE) ================= */

  useEffect(() => {
    axios
      .get("https://oadiscussion.onrender.com/api/sidebar/insights")
      .then((res) => setInsights(res.data))
      .catch(() => {});

    axios
      .get("https://oadiscussion.onrender.com/api/ai/ai-tip")
      .then((res) => setAiTip(res.data.tip))
      .catch(() => {});
  }, []);

  /* ================= LOADING ================= */

  if (!insights) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  /* ================= WRAPPER ================= */

  const Wrapper = ({ children }) =>
    mobile ? (
      <div className="space-y-4">{children}</div>
    ) : (
      <aside className="hidden xl:block sticky top-16">
        <div
          className="
            h-[calc(100vh-4rem)]
            overflow-y-auto
            pr-2
            space-y-4
            hover-scrollbar
          "
        >
          {children}
        </div>
      </aside>
    );

  return (
    <Wrapper>
      {/* ================= TRENDING COMPANIES ================= */}
      <InsightCard
        title="Trending Companies"
        subtitle="Most discussed in recent OA experiences"
        icon={TrendingUp}
        accent="from-orange-500/20"
      >
        <div className="space-y-2">
          {insights.trendingCompanies.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-muted"
            >
              <span className="text-sm font-medium">{c.name}</span>
              <span className="text-xs text-muted-foreground">
                {c.count} posts
              </span>
            </div>
          ))}
        </div>
      </InsightCard>

      {/* ================= TOPICS ================= */}
      <InsightCard
        title="Most Asked Topics"
        subtitle="High-frequency OA concepts"
        icon={Brain}
        accent="from-indigo-500/20"
      >
        <div className="flex flex-wrap gap-2">
          {insights.topTopics.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </InsightCard>

      {/* ================= PATTERNS ================= */}
      <InsightCard
        title="Common Question Patterns"
        subtitle="Repeated problem structures"
        icon={Puzzle}
        accent="from-purple-500/20"
      >
        <div className="flex flex-wrap gap-2">
          {insights.topPatterns.map((p) => (
            <Badge key={p} variant="pattern">
              {format(p)}
            </Badge>
          ))}
        </div>
      </InsightCard>

      {/* ================= AI TIP ================= */}
      <InsightCard
        title="AI OA Tip"
        subtitle="Generated from recent experiences"
        icon={Sparkles}
        accent="from-emerald-500/20"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {aiTip || "Generating smart OA insight…"}
        </p>

        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={() => (window.location.href = "/app/forum")}
        >
          Share Your Experience
        </Button>
      </InsightCard>
    </Wrapper>
  );
});

export default RightSidebar;

/* ========================================================= */
/* ===================== UI BLOCKS ========================== */
/* ========================================================= */

function InsightCard({ title, subtitle, icon: Icon, accent, children }) {
  return (
    <motion.div
      initial={false}   // ✅ PREVENT RE-ANIMATION ON RE-RENDER
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="relative overflow-hidden p-4">
        <div
          className={`absolute inset-x-0 top-0 h-12 bg-gradient-to-b ${accent} to-transparent`}
        />

        <div className="relative space-y-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold leading-none">
                {title}
              </p>
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>

          {children}
        </div>
      </Card>
    </motion.div>
  );
}

function Badge({ children, variant }) {
  const base =
    "rounded-md border px-2 py-1 text-xs font-medium";
  const styles =
    variant === "pattern"
      ? "bg-purple-500/10 border-purple-500/20 text-purple-300"
      : "bg-muted text-muted-foreground";

  return <span className={`${base} ${styles}`}>{children}</span>;
}

function format(str) {
  return str.replace(/_/g, " ").toUpperCase();
}
