import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4"
    >
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-3 text-lg font-semibold">
        Page not found
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you are looking for doesn’t exist or was moved.
      </p>

      <Link to="/" className="mt-6">
        <Button>
          Go back home
        </Button>
      </Link>
    </motion.div>
  );
}
