import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
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

/* ============================
   TOPIC OPTIONS
============================ */
const TOPIC_OPTIONS = [
  "ARRAY",
  "STRING",
  "DP",
  "GREEDY",
  "GRAPH",
  "TREE",
  "LINKED_LIST",
  "STACK",
  "QUEUE",
  "HASHMAP",
  "SQL",
  "OS",
  "DBMS",
  "CN",
];

/* ============================
   DSA QUESTION PATTERNS
============================ */
const PATTERN_OPTIONS = [
  "BRUTE_FORCE",
  "SIMULATION",
  "TWO_POINTER",
  "SLIDING_WINDOW",
  "PREFIX_SUM",
  "SUFFIX_SUM",
  "FREQUENCY_COUNT",
  "BINARY_SEARCH",
  "SLOW_FAST_POINTER",
  "MERGE_SORT",
  "QUICK_SORT",
  "HASHING",
  "SET_USAGE",
  "MONOTONIC_STACK",
  "MONOTONIC_QUEUE",
  "STACK_USAGE",
  "QUEUE_USAGE",
  "FAST_SLOW_POINTER",
  "INPLACE_REVERSAL",
  "TREE_TRAVERSAL",
  "DFS_TREE",
  "BFS_TREE",
  "LOWEST_COMMON_ANCESTOR",
  "DFS_GRAPH",
  "BFS_GRAPH",
  "TOPOLOGICAL_SORT",
  "DIJKSTRA",
  "BELLMAN_FORD",
  "UNION_FIND",
  "DP_1D",
  "DP_2D",
  "DP_ON_GRIDS",
  "DP_ON_SUBSEQUENCES",
  "KNAPSACK",
  "LIS",
  "GREEDY_INTERVALS",
  "BIT_MANIPULATION",
  "RECURSION",
  "BACKTRACKING",
  "DIVIDE_AND_CONQUER",
];

export default function Forum() {
  const [topics, setTopics] = useState([]);
  const [questionPatterns, setQuestionPatterns] = useState([]);
  const [experienceText, setExperienceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const navigate = useNavigate();

  /* ============================
     AI GENERATE
  ============================ */
  const generateWithAI = async () => {
    if (topics.length === 0 || questionPatterns.length === 0) {
      toast.error("Select topics and question patterns first");
      return;
    }

    try {
      setAiLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/ai/generate-description",
        {
          role: document.querySelector("input[name='role']").value,
          platform: document.querySelector("input[name='oaPlatform']").value,
          difficulty:
            document.querySelector("input[name='difficulty']").value ||
            "Medium",
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
      toast.success("AI description generated");
    } catch {
      toast.error("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  /* ============================
     SUBMIT
  ============================ */
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (topics.length === 0 || questionPatterns.length === 0) {
      toast.error("Select topics and question patterns");
      setLoading(false);
      return;
    }

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
      await axios.post("http://localhost:5000/api/experience", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Experience posted successfully");
      setTopics([]);
      setQuestionPatterns([]);
      setExperienceText("");
      navigate("/app/feed");
    } catch {
      toast.error("Failed to post experience");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
            {/* Company & Role */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="company" placeholder="Company" required />
              <Input name="role" placeholder="Role" required />
            </div>

            {/* Platform & Difficulty */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="oaPlatform" placeholder="OA Platform" required />
              <Input name="difficulty" placeholder="Difficulty" required />
            </div>

            {/* Salary */}
            <Input
              name="salaryLPA"
              type="number"
              min="0"
              step="0.1"
              placeholder="Salary (LPA)"
            />

            {/* Experience */}
            <Textarea
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              placeholder="Write your OA / interview experience..."
              className="min-h-[200px]"
              required
            />

            {/* AI Button */}
            <Button
              type="button"
              variant="outline"
              disabled={
                aiLoading ||
                topics.length === 0 ||
                questionPatterns.length === 0
              }
              onClick={generateWithAI}
              className="w-full gap-2"
            >
              {aiLoading ? "Generating..." : "Generate with AI"}
              <Sparkles className="h-4 w-4" />
            </Button>

            {/* Topics + Question Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Topics */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Topics</p>

                <Select
                  onValueChange={(value) =>
                    !topics.includes(value) &&
                    setTopics((prev) => [...prev, value])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select topics" />
                  </SelectTrigger>

                  <SelectContent>
                    {TOPIC_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      onClick={() =>
                        setTopics(topics.filter((x) => x !== t))
                      }
                      className="cursor-pointer"
                    >
                      {t} ✕
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Question Patterns */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Question Patterns</p>

                <Select
                  onValueChange={(value) =>
                    !questionPatterns.includes(value) &&
                    setQuestionPatterns((prev) => [...prev, value])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patterns" />
                  </SelectTrigger>

                  <SelectContent>
                    {PATTERN_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2">
                  {questionPatterns.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      onClick={() =>
                        setQuestionPatterns(
                          questionPatterns.filter((x) => x !== p)
                        )
                      }
                      className="cursor-pointer"
                    >
                      {p.replaceAll("_", " ")} ✕
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? "Posting..." : "Post Experience"}
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
