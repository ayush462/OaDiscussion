import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send } from "lucide-react";
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

export default function Forum() {
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const addTopic = () => {
    if (!topicInput.trim()) return;
    if (topics.includes(topicInput.trim())) return;

    setTopics([...topics, topicInput.trim()]);
    setTopicInput("");
  };

  const removeTopic = (t) => {
    setTopics(topics.filter((x) => x !== t));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const data = {
      company: formData.get("company"),
      role: formData.get("role"),
      oaPlatform: formData.get("oaPlatform"),
      difficulty: formData.get("difficulty"),
      experienceText: formData.get("experienceText"),
      topics,
    };

    try {
      await axios.post(
        "http://localhost:5000/api/experience",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Experience posted ");
      e.target.reset();
      setTopics([]);
      navigate("/app/feed");
    } catch (err) {
      toast.error("Failed to post experience");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl"
    >
      <Card
  className="
    border border-white/20
    bg-card
    backdrop-blur
    shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]
  "
>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Share OA / Interview Experience
          </CardTitle>
          <CardDescription>
            Help others by sharing real hiring insights 
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {/* Company & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="company"
                placeholder="Company (Google, Amazon)"
                required
              />
              <Input
                name="role"
                placeholder="Role (SDE Intern)"
                required
              />
            </div>

            {/* Platform & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="oaPlatform"
                placeholder="OA Platform (HackerRank)"
                required
              />
              <Input
                name="difficulty"
                placeholder="Difficulty (Easy / Medium / Hard)"
                required
              />
            </div>

            {/* Experience */}
            <Textarea
              name="experienceText"
              placeholder="Describe the OA / Interview experience..."
              className="min-h-[140px]"
              required
            />

            {/* Topics */}
            <div>
              <div className="flex gap-2">
                <Input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Add topic (Arrays, DP, SQL)"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTopic}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Tags */}
              <motion.div
                layout
                className="mt-2 flex flex-wrap gap-2"
              >
                {topics.map((t) => (
                  <motion.div
                    key={t}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-destructive hover:text-white"
                      onClick={() => removeTopic(t)}
                    >
                      {t} ✕
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Submit */}
                    <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? "Posting..." : "Post Experience"}
            <Send className="h-4 w-4" />
          </Button>

          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
