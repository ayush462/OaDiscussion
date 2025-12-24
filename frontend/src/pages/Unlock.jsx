import { useEffect, useState } from "react";
import axios from "axios";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Unlocks() {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("https://oadiscussion.onrender.com/api/users/me/unlocks", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error("UNLOCK FETCH ERROR", err));
  }, []);

  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">
        Unlocks ({data.points} points)
      </h2>

      {data.unlocks.map((u) => (
        <Card key={u.key}>
          <CardHeader className="font-semibold">
            {u.title}
          </CardHeader>

          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Required: {u.requiredPoints} points
            </p>

            {u.unlocked ? (
              u.link ? (
                <Button asChild>
                  <a
                    href={u.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open
                  </a>
                </Button>
              ) : (
                <span className="text-emerald-400 font-medium">
                  Unlocked ✔
                </span>
              )
            ) : (
              <Button disabled>
                Locked 🔒
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
