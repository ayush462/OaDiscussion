import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Trophy, Medal, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

/* ================= HELPERS ================= */

const medalColor = (rank) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-amber-600";
  return "text-muted-foreground";
};

const BAR_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#14b8a6",
];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const myEmail = localStorage.getItem("email");

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/users/leaderboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setUsers(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const topUsers = users.slice(0, 5);

  /* ================= LOADER ================= */

  if (loading) {
    return (
      <div className="w-full px-3 sm:px-4 sm:max-w-5xl sm:mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  /* ================= EMPTY ================= */

  if (!users.length) {
    return (
      <div className="text-center py-20">
        <Trophy className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          No leaderboard data available yet.
        </p>
      </div>
    );
  }

  /* ================= PAGE ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="
        w-full
        px-3
        sm:px-4
        space-y-6
        sm:max-w-5xl
        sm:mx-auto
      "
    >
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Top contributors ranked by points
        </p>
      </div>

      {/* CHART (UNCHANGED) */}
      <Card className="border-white/10 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Top Contributors
          </CardTitle>
          <CardDescription>
            Highest points earned
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[200px] sm:h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topUsers}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />

              <XAxis
                dataKey="email"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  v.split("@")[0].slice(0, 8)
                }
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />

              <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                {topUsers.map((_, i) => (
                  <Cell
                    key={i}
                    fill={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* TABLE (UNCHANGED) */}
      <Card className="border-white/10 w-full">
        <CardHeader>
          <CardTitle>All Rankings</CardTitle>
          <CardDescription>
            Complete leaderboard
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto w-full">
          <Table className="min-w-[520px]">
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">
                  Points
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((u, i) => {
                const rank = i + 1;
                const isMe = u.email === myEmail;

                return (
                  <TableRow
                    key={u._id}
                    className={
                      isMe
                        ? "bg-sky-500/10 hover:bg-sky-500/20"
                        : "hover:bg-muted/40"
                    }
                  >
                    <TableCell>
                      {rank <= 3 ? (
                        <div className="flex items-center gap-1">
                          <Medal
                            className={`h-4 w-4 ${medalColor(rank)}`}
                          />
                          #{rank}
                        </div>
                      ) : (
                        `#${rank}`
                      )}
                    </TableCell>

                    <TableCell className="truncate max-w-[240px]">
  <div className="flex items-center gap-2">
    {isMe && (
      <User className="h-4 w-4 text-sky-400" />
    )}

    <Link
      to={`/user/${u._id}`}
      className="hover:underline hover:text-emerald-400 transition truncate"
    >
      {u.email}
    </Link>

    {isMe && (
      <Badge className="bg-sky-500/20 text-sky-400">
        You
      </Badge>
    )}
  </div>
</TableCell>


                    <TableCell className="text-right font-semibold">
                      {u.points}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
