import { useEffect, useState,useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  SlidersHorizontal,
  Coins,
  Search,
} from "lucide-react";

import ExperienceCard from "../components/ExperienceCard";
import RightSidebar from "./RightSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

import {
  COMPANY_FILTERS,
  ROLE_FILTERS,
  TOPIC_FILTERS,
  PATTERN_FILTERS,
} from "../services/filter";

import { getCompanyKey } from "../services/normalize";

/* ================= PUSH HELPERS ================= */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
const LIMIT = 10;


/* ========================================================= */

export default function Feed() {
  const [data, setData] = useState([]);
  const [locked, setLocked] = useState(false);
  const [cursor, setCursor] = useState(null); // NEW
  const [hasMore, setHasMore] = useState(true); // NEW
  const [loading, setLoading] = useState(true); // UNCHANGED
  const [loadingMore, setLoadingMore] = useState(false); // NEW

  /* MOBILE */
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileInsightOpen, setMobileInsightOpen] = useState(false);

  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [followLoaded, setFollowLoaded] = useState(false);

  const [dailyClaimed, setDailyClaimed] = useState(false);

  /* 🔔 PUSH UI */
  const [showPushUI, setShowPushUI] = useState(false);

  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get("post");
   const observerRef = useRef(null); // NEW
  const loadMoreRef = useRef(null); // NEW
  const fetchingCursorRef = useRef(null);


  /* ================= SERVICE WORKER REGISTER (FIX) ================= */

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("✅ Service Worker registered"))
      .catch((err) => console.error("❌ SW registration failed", err));
  }, []);

  /* ================= SCROLL TO POST ================= */

  useEffect(() => {
    if (!targetPostId || data.length === 0) return;

    const el = document.getElementById(`post-${targetPostId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "nearest" });

    el.classList.add("ring-2", "ring-primary");
    setTimeout(() => {
      el.classList.remove("ring-2", "ring-primary");
    }, 1800);
  }, [targetPostId, data]);

  /* ================= FILTER STATE ================= */

  const [filters, setFilters] = useState({
    company: "",
    role: "",
    topic: "",
    pattern: "",
    minSalary: "",
    maxSalary: "",
    search: "",
  });

  /* ================= FETCH FEED ================= */

  const loadInitialFeed = async () => {
  setLoading(true);
  try {
    const res = await axios.get(
      "http://localhost:5000/api/experience",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: LIMIT },
      }
    );

    setData(res.data.data || []);
    setCursor(res.data.nextCursor);
    setHasMore(res.data.hasMore);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  loadInitialFeed();
}, []);


const loadMore = async () => {
  if (!hasMore || loadingMore) return;

  // 🚫 SAME CURSOR GUARD
  if (fetchingCursorRef.current === cursor) return;
  fetchingCursorRef.current = cursor;

  setLoadingMore(true);
  try {
    const res = await axios.get(
      "http://localhost:5000/api/experience",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          cursor,
          limit: LIMIT,
        },
      }
    );

    // 🚫 EMPTY RESPONSE = STOP
    if (!res.data.data?.length) {
      setHasMore(false);
      return;
    }

    setData(prev => {
      const existingIds = new Set(prev.map(p => p._id));
      const newItems = res.data.data.filter(
        item => !existingIds.has(item._id)
      );
      return [...prev, ...newItems];
    });

    setCursor(res.data.nextCursor);
    setHasMore(res.data.hasMore);
  } finally {
    setLoadingMore(false);
  }
};

useEffect(() => {
  if (!hasMore) return;

  if (observerRef.current) observerRef.current.disconnect();

  observerRef.current = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        loadMore();
      }
    },
    { rootMargin: "200px" }
  );

  if (loadMoreRef.current) {
    observerRef.current.observe(loadMoreRef.current);
  }

  return () => observerRef.current?.disconnect();
}, [hasMore, cursor]); // ❌ REMOVE data



  /* ================= FOLLOWED COMPANIES ================= */

  useEffect(() => {
    if (!token) {
      setFollowLoaded(true);
      return;
    }

    axios
      .get("http://localhost:5000/api/users/followed/companies", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        setFollowedCompanies((res.data || []).map(getCompanyKey))
      )
      .finally(() => setFollowLoaded(true));
  }, []);

  /* ================= PUSH UI DETECTION ================= */

 

  /* ================= PUSH SUBSCRIBE FROM UI ================= */
   const enablePushFromUI = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await axios.post(
        "http://localhost:5000/api/push/subscribe",
        sub,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowPushUI(false);
    } catch (err) {
      console.error("Push UI subscribe failed", err);
    }
  };


  /* ================= PUSH UI DETECTION (FINAL FIX) ================= */

/* ================= PUSH UI VISIBILITY (FINAL) ================= */

useEffect(() => {
  if (!("serviceWorker" in navigator)) return;

  const checkPushStatus = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    /*
      SHOW UI WHEN:
      - permission is "default" (never asked)
      - OR permission is "granted" but subscription missing
    */
    if (
      Notification.permission === "default" ||
      (Notification.permission === "granted" && !sub)
    ) {
      setShowPushUI(true);
    } else {
      setShowPushUI(false);
    }
  };

  checkPushStatus();
}, []);


  /* ================= DAILY CLAIM ================= */

  useEffect(() => {
  if (!token) return;

  axios.post(
    "http://localhost:5000/api/shop/claim",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      silent: true, // 🔇 IMPORTANT
    }
  )
  .then(() => {
    setDailyClaimed(true);
    setTimeout(() => setDailyClaimed(false), 3000);
  })
  .catch(() => {});
}, []);


  /* ================= APPLY FILTER ================= */

  const applyQuickFilter = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    if ("search" in newFilters) return;

    const { search, ...backendFilters } = updated;

    setLoading(true);
    axios
      .get("http://localhost:5000/api/experience/filter", {
        headers: { Authorization: `Bearer ${token}` },
        params: backendFilters,
      })
      
      .then((res) => {
        setData(res.data || []);
        setLocked(false);
        setCursor(null);
         setHasMore(false);
        setMobileFilterOpen(false);
        toast.success("Filters applied");
      })
      .finally(() => setLoading(false));
  };

  const clearFilter = () => {
    setFilters({
      company: "",
      role: "",
      topic: "",
      pattern: "",
      minSalary: "",
      maxSalary: "",
      search: "",
    });
    loadInitialFeed();
    setMobileFilterOpen(false);
  };

  const hasActiveFilter =
    filters.company ||
    filters.role ||
    filters.topic ||
    filters.pattern ||
    filters.minSalary;

  /* ================= RENDER ================= */

  return (
    <>
      {/* 🔔 PUSH UI */}
    

      {/* ================= LOADER ================= */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DAILY CLAIM ================= */}
     {/* ================= DAILY CLAIM (COOL CENTER MODAL) ================= */}
<AnimatePresence>
  {dailyClaimed && (
    <motion.div
      key="daily-claim"
      className="fixed inset-0 z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.75, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative z-10"
      >
        {/* Gradient Glow Ring */}
        <div className="rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-[2px] shadow-2xl">
          <Card className="relative overflow-hidden rounded-3xl bg-background px-8 py-7 text-center">

            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-yellow-400/30 blur-3xl" />

            {/* Coin animation */}
            <motion.div
              initial={{ scale: 0.6, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500"
            >
              <Coins className="h-8 w-8" />
            </motion.div>

            <h3 className="text-lg font-semibold tracking-tight">
              Daily Reward Claimed
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Thanks for coming back today
            </p>

            {/* Reward pills */}
            <div className="mt-4 flex justify-center gap-2">
              <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-600">
                +1 Coin
              </span>
              <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-600">
                +5 Points
              </span>
            </div>

            {/* Sparkles */}
            <FloatingSparkle className="-left-3 top-6" delay={0} />
            <FloatingSparkle className="right-4 top-2" delay={0.6} />
            <FloatingSparkle className="left-1/2 bottom-2" delay={1.1} />
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      {/* ================= MAIN ================= */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
          {/* LEFT FILTER */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 h-[calc(100vh-3rem)] pr-2 space-y-6 overflow-y-auto scrollbar-hide">
              <Filters filters={filters} apply={applyQuickFilter} />
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={clearFilter}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </aside>

          {/* FEED */}
          <main className="lg:col-span-6 space-y-6">
            <div className="mx-auto w-full max-w-[36rem] space-y-4">
               <AnimatePresence>
  {showPushUI && (
    <motion.div
      key="push-ui"
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="mx-auto mt-4 max-w-[36rem]"
    >
      {/* Gradient Border */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40 p-[1px] shadow-lg">
        <Card className="relative overflow-hidden rounded-2xl border-0 bg-background/80 backdrop-blur-lg">

          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-indigo-500/20 blur-2xl" />

          <div className="flex items-center gap-4 px-5 py-4">
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 4 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-500"
            >
              🔔
            </motion.div>

            {/* Text */}
            <div className="flex-1">
              <p className="text-sm font-semibold tracking-tight">
                Stay updated
              </p>
              <p className="text-xs text-muted-foreground">
                Get notified when new OA experiences are posted
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-full px-4 shadow-md transition hover:scale-[1.03]"
                onClick={enablePushFromUI}
              >
                Enable
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => setShowPushUI(false)}
              >
                Later
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )}
</AnimatePresence>

             <AnimatePresence>
  {followLoaded && data.length === 0 && !loading && (
    <EmptyFeed3D onReset={clearFilter} />
  )}

  {followLoaded &&
    data.map((exp) => {
      const companyKey = getCompanyKey(exp.company);
      const isFollowing = followedCompanies.includes(companyKey);

      return (
        <motion.div
          key={exp._id}
          id={`post-${exp._id}`}
          style={{ scrollMarginTop: "110px" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          <ExperienceCard
            exp={exp}
            compact
            isFollowing={isFollowing}
            onFollowChange={(company, followed) => {
              const key = getCompanyKey(company);
              setFollowedCompanies((prev) =>
                followed
                  ? [...new Set([...prev, key])]
                  : prev.filter((c) => c !== key)
              );
            }}
          />
        </motion.div>
      );
    })}
</AnimatePresence>
{hasMore && (
  <div ref={loadMoreRef} className="py-8 flex justify-center">
    {loadingMore && (
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    )}
  </div>
)}

{!hasMore && data.length > 0 && (
  <p className="text-center text-xs text-muted-foreground py-6">
    You’ve reached the end
  </p>
)}


            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block xl:col-span-3">
            <RightSidebar />
          </aside>
        </div>
      </div>

      {/* ================= MOBILE BUTTONS ================= */}
      <div className="lg:hidden fixed bottom-5 right-5 z-40 flex flex-col gap-3">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-white shadow-lg"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        <button
          onClick={() => setMobileInsightOpen(true)}
          className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-white shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          Insights
        </button>
      </div>

      {/* ================= MOBILE FILTER ================= */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] rounded-t-2xl bg-background p-4 overflow-y-auto"
            >
              <Filters filters={filters} apply={applyQuickFilter} />
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  className="mt-6 w-full"
                  onClick={clearFilter}
                >
                  Clear all filters
                </Button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= MOBILE INSIGHTS ================= */}
      <AnimatePresence>
        {mobileInsightOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileInsightOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 z-50 h-[80vh] rounded-t-2xl bg-background p-4 overflow-y-auto"
            >
              <RightSidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================= FILTER COMPONENTS ================= */

function Filters({ filters, apply }) {
  const q = filters.search.toLowerCase();
  const filterList = (list) =>
    list.filter((item) => item.toLowerCase().includes(q));

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search filters..."
          value={filters.search}
          onChange={(e) => apply({ search: e.target.value })}
          className="w-full rounded border pl-9 px-3 py-2 text-sm"
        />
      </div>

      <FilterSection title="Company">
        {filterList(COMPANY_FILTERS).map((c) => (
          <FilterPill
            key={c}
            active={filters.company === c}
            onClick={() => apply({ company: c })}
          >
            {c}
          </FilterPill>
        ))}
      </FilterSection>

      <FilterSection title="Role">
        {filterList(ROLE_FILTERS).map((r) => (
          <FilterPill
            key={r}
            active={filters.role === r}
            onClick={() => apply({ role: r })}
          >
            {r}
          </FilterPill>
        ))}
      </FilterSection>

      <FilterSection title="Topic">
        {filterList(TOPIC_FILTERS).map((t) => (
          <FilterPill
            key={t}
            active={filters.topic === t}
            onClick={() => apply({ topic: t })}
          >
            {t}
          </FilterPill>
        ))}
      </FilterSection>

      <FilterSection title="Pattern">
        {filterList(PATTERN_FILTERS).map((p) => (
          <FilterPill
            key={p}
            active={filters.pattern === p}
            onClick={() => apply({ pattern: p })}
          >
            {p}
          </FilterPill>
        ))}
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterPill({ children, active, onClick }) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      className="rounded-full"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
/* ========================================================= */
/* 🔮 3D EMPTY STATE — NO FEED FOUND                          */
/* ========================================================= */

/* ========================================================= */
/* ⭐ EMPTY STATE — SOFT GLOW + FLOATING STARS                 */
/* ========================================================= */

function EmptyFeed3D({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mt-12 flex justify-center"
    >
      {/* Glow background */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"
      />

      {/* Floating stars */}
      <FloatingStar className="-left-6 top-8" delay={0} />
      <FloatingStar className="right-6 top-2" delay={0.6} />
      <FloatingStar className="-right-10 top-16" delay={1.2} />

      {/* Main content */}
      <div className="relative z-10 max-w-md rounded-3xl border bg-background/80 px-8 py-12 text-center backdrop-blur-xl shadow-lg">
        <h3 className="text-xl font-semibold tracking-tight">
          No experiences found
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to explore and share experiences
        </p>

        <Button
          onClick={onReset}
          className="mt-6 rounded-full px-7 shadow-sm"
        >
          Reset filters
        </Button>
      </div>
    </motion.div>
  );
}

/* ================= FLOATING STAR ================= */

function FloatingStar({ className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -14, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute text-yellow-400 ${className}`}
    >
      ✨
    </motion.div>
  );
}

function FloatingSparkle({ className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.6, 1, 1, 0.6],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2.8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`pointer-events-none absolute text-yellow-400 ${className}`}
    >
      ✨
    </motion.div>
  );
}

