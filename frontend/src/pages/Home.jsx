import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Trophy,
  Lock,
  Users,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleGetStarted = () => {
    if (!isLoggedIn) {
      navigate("/signup");
    } else {
      toast.info("You are already logged in");
    }
  };

  const handleLogin = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      toast.info("You are already logged in");
    }
  };

  const handleShareExperience = () => {
    if (!isLoggedIn) {
      toast.error("Please login to share your experience");
      navigate("/login");
      return;
    }
    navigate("/app/forum");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-6 pt-28 pb-20">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center space-y-6"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Real OA & Interview Experiences
            <span className="block text-primary">
              from Real Candidates
            </span>
          </motion.h1>

          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Read authentic online assessment and interview experiences,
            learn patterns, and contribute back to the community.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex justify-center gap-4"
          >
            <Button
              size="lg"
              className="gap-2"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/20 hover:border-primary/40"
              onClick={handleLogin}
            >
              Login
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card
                className="
                  h-full
                  border border-white/20
                  bg-card
                  p-6
                  shadow-[0_10px_30px_-15px_rgba(255,255,255,0.12)]
                  hover:border-primary/40
                  transition
                "
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-semibold text-lg">
                  {f.title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {f.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="
            mx-auto max-w-4xl
            rounded-2xl
            border border-white/20
            bg-gradient-to-br from-primary/20 to-transparent
            p-10
            text-center
          "
        >
          <h2 className="text-2xl font-semibold">
            Unlock the full feed by contributing
          </h2>

          <p className="mt-2 text-muted-foreground">
            Share one experience and get access to hundreds from others.
          </p>

          <Button
            size="lg"
            className="mt-6 gap-2"
            onClick={handleShareExperience}
          >
            Share Your First Experience
            <Sparkles className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Verified Experiences",
    desc: "Real OA and interview rounds shared by candidates.",
    icon: Lock,
  },
  {
    title: "Community Driven",
    desc: "Upvote, learn patterns, and help others prepare.",
    icon: Users,
  },
  {
    title: "Leaderboard",
    desc: "Earn points and rank among top contributors.",
    icon: Trophy,
  },
];
