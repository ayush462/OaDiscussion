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
} from "recharts";
import { Trophy } from "lucide-react";

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
const EMERALD = "hsl(var(--primary))";
const MUTED = "hsl(var(--muted-foreground))";
const BORDER = "hsl(var(--border))";


export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users/leaderboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setUsers(res.data || []));
  }, []);

  const topUsers = users.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Top contributors based on community points
        </p>
      </div>

      {/* CHART */}
      <Card className="border border-white/20 bg-card">

        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>
            Highest points earned this period
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topUsers}>
              <XAxis
                dataKey="email"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => v.split("@")[0]}
              />
              <YAxis />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Bar
                dataKey="points"
                radius={[6, 6, 0, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>All Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
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
              {users.map((u, i) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">
                    {i < 3 ? (
                      <Badge
                        variant="secondary"
                        className="flex w-fit items-center gap-1"
                      >
                        <Trophy className="h-3 w-3" />
                        #{i + 1}
                      </Badge>
                    ) : (
                      `#${i + 1}`
                    )}
                  </TableCell>

                  <TableCell>
                    {u.email}
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    {u.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
