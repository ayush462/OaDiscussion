import axios from "axios";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpvoteButton({ id, count }) {
  const upvote = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/experience/${id}/upvote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 🔄 simple refresh (can be optimized later)
      window.location.reload();
    } catch (err) {
      console.error("Upvote failed");
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={upvote}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <ArrowUp className="h-4 w-4" />
        <span className="text-sm font-medium">{count}</span>
      </Button>
    </motion.div>
  );
}
