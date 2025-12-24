import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ============================ */
/* OPTIONS */
/* ============================ */

const TOPIC_OPTIONS = [
  "ARRAY","STRING","DP","GREEDY","GRAPH","TREE","LINKED_LIST",
  "STACK","QUEUE","HASHMAP","SQL","OS","DBMS","CN",
];

const PATTERN_OPTIONS = [
  "BRUTE_FORCE","SIMULATION","TWO_POINTER","SLIDING_WINDOW",
  "PREFIX_SUM","SUFFIX_SUM","FREQUENCY_COUNT","BINARY_SEARCH",
  "SLOW_FAST_POINTER","MERGE_SORT","QUICK_SORT","HASHING",
  "SET_USAGE","MONOTONIC_STACK","MONOTONIC_QUEUE",
  "STACK_USAGE","QUEUE_USAGE","FAST_SLOW_POINTER",
  "INPLACE_REVERSAL","TREE_TRAVERSAL","DFS_TREE","BFS_TREE",
  "LOWEST_COMMON_ANCESTOR","DFS_GRAPH","BFS_GRAPH",
  "TOPOLOGICAL_SORT","DIJKSTRA","BELLMAN_FORD","UNION_FIND",
  "DP_1D","DP_2D","DP_ON_GRIDS","DP_ON_SUBSEQUENCES",
  "KNAPSACK","LIS","GREEDY_INTERVALS","BIT_MANIPULATION",
  "RECURSION","BACKTRACKING","DIVIDE_AND_CONQUER",
];

export default function Forum() {
  const [topics, setTopics] = useState([]);
  const [questionPatterns, setQuestionPatterns] = useState([]);
  const [experienceText, setExperienceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= AI GENERATE ================= */

  const generateWithAI = async () => {
    if (!topics.length || !questionPatterns.length) {
      toast.error("Select topics and question patterns first");
      return;
    }

    const toastId = toast.loading("Generating with AI…");

    try {
      setAiLoading(true);

      const res = await axios.post(
        "https://oadiscussion.onrender.com/api/ai/generate-description",
        {
          role: document.querySelector("input[name='role']").value,
          platform: document.querySelector("input[name='oaPlatform']").value,
          difficulty:
            document.querySelector("input[name='difficulty']").value || "Medium",
          topics,
          questionPatterns,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setExperienceText(res.data.text);
      toast.success("AI description generated", { id: toastId });
    } catch {
      toast.error("AI generation failed", { id: toastId });
    } finally {
      setAiLoading(false);
    }
  };

  /* ================= SUBMIT ================= */

  const submit = async (e) => {
    e.preventDefault();

    if (!topics.length || !questionPatterns.length) {
      toast.error("Select topics and question patterns");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Posting experience…");

    const data = {
      company: e.target.company.value,
      role: e.target.role.value,
      oaPlatform: e.target.oaPlatform.value,
      difficulty: e.target.difficulty.value,
      experienceText,
      topics,
      questionPatterns,
      salaryLPA: e.target.salaryLPA.value
        ? Number(e.target.salaryLPA.value)
        : undefined,
    };

    try {
      const res = await axios.post(
        "https://oadiscussion.onrender.com/api/experience",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Experience posted successfully", { id: toastId });

      // ✅ reliable redirect
      navigate(`/app/experience/${res.data.experienceId}`, { replace: true });
    } catch {
      toast.error("Failed to post experience", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAGE ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mx-auto max-w-2xl"
    >
      <Card className="border border-white/20 bg-card backdrop-blur shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Share OA / Interview Experience
          </CardTitle>
          <CardDescription>
            Use AI or write manually — help others crack OAs
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="company" placeholder="Company" required />
              <Input name="role" placeholder="Role" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input name="oaPlatform" placeholder="OA Platform" required />
              <Input name="difficulty" placeholder="Difficulty" required />
            </div>

            <Input
              name="salaryLPA"
              type="number"
              min="0"
              step="0.1"
              placeholder="Salary (LPA)"
            />

            <Textarea
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              placeholder="Write your OA / interview experience..."
              className="min-h-[100px]"
              required
            />

            {/* AI BUTTON */}
            <Button
              type="button"
              variant="outline"
              onClick={generateWithAI}
              disabled={aiLoading}
              className="w-full gap-2"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  Generate with AI
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Topics & Patterns */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Topics</p>
                <Select onValueChange={(v) => !topics.includes(v) && setTopics(p => [...p, v])}>
                  <SelectTrigger><SelectValue placeholder="Select topics" /></SelectTrigger>
                  <SelectContent>
                    {TOPIC_OPTIONS.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2">
                  {topics.map(t => (
                    <Badge key={t} onClick={() => setTopics(topics.filter(x => x !== t))} className="cursor-pointer">
                      {t} ✕
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Question Patterns</p>
                <Select onValueChange={(v) => !questionPatterns.includes(v) && setQuestionPatterns(p => [...p, v])}>
                  <SelectTrigger><SelectValue placeholder="Select patterns" /></SelectTrigger>
                  <SelectContent>
                    {PATTERN_OPTIONS.map(p => (
                      <SelectItem key={p} value={p}>
                        {p.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2">
                  {questionPatterns.map(p => (
                    <Badge
                      key={p}
                      variant="outline"
                      onClick={() =>
                        setQuestionPatterns(questionPatterns.filter(x => x !== p))
                      }
                      className="cursor-pointer"
                    >
                      {p.replaceAll("_", " ")} ✕
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  Post Experience
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
