import * as React from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import NotificationBell from "../components/notification.jsx";

import {
  Home,
  LayoutDashboard,
  MessageSquare,
  Trophy,
  Bookmark,
  User,
  TrendingUp,
  BarChart3,
  Shield,
  Users,
  FileText,
  Menu,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent, // ✅ IMPORTANT
} from "@/components/ui/navigation-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

/* ======================================================= */
/* NAV CONFIG                                              */
/* ======================================================= */

const NAV_ITEMS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Feed", to: "/app/feed", icon: LayoutDashboard },
  { label: "Forum", to: "/app/forum", icon: MessageSquare },
  { label: "Leaderboard", to: "/app/leaderboard", icon: Trophy },
  { label: "Trending", to: "/trending", icon: TrendingUp },
];

const AUTH_ITEMS = [
  { label: "Saved", to: "/bookmarks", icon: Bookmark },
  { label: "Profile", to: "/app/profile", icon: User },
  { label: "Compare", to: "/app/compare", icon: BarChart3 },
];

const ADMIN_ITEMS = [
  { label: "Dashboard", to: "/app/admin", icon: LayoutDashboard },
  { label: "Users", to: "/app/admin/users", icon: Users },
  { label: "Reports", to: "/app/admin/reports", icon: FileText },
];

/* ======================================================= */

export default function AppLayout() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  const isLoggedIn = Boolean(token);

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full">
      {/* ================= NAVBAR ================= */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          {/* MOBILE LEFT */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="bg-card">
                <MobileNav
                  isLoggedIn={isLoggedIn}
                  role={role}
                  email={email}
                  logout={logout}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* MOBILE RIGHT */}
          <div className="ml-auto md:hidden">
            {isLoggedIn && <NotificationBell mobile />}
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex w-full items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {NAV_ITEMS.map((item) => (
                  <DesktopNavItem key={item.to} {...item} />
                ))}

                {isLoggedIn &&
                  AUTH_ITEMS.map((item) => (
                    <DesktopNavItem key={item.to} {...item} />
                  ))}

                {role === "admin" && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <ul className="grid w-[220px] gap-1 p-2">
                        {ADMIN_ITEMS.map((item) => (
                          <AdminItem key={item.to} {...item} />
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* RIGHT SIDE */}
            <div className="ml-auto flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-accent cursor-pointer">
                        <User className="h-4 w-4" />
                        <span className="text-sm truncate max-w-[180px]">
                          {email}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end">
                      <p className="text-xs">{email}</p>
                      {role === "admin" && (
                        <p className="text-xs text-muted-foreground">Admin</p>
                      )}
                    </TooltipContent>
                  </Tooltip>

                  <NotificationBell />

                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/login")}>Login</Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ================= CONTENT ================= */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full px-3 sm:px-4 pt-4 sm:pt-6 sm:max-w-7xl sm:mx-auto"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}

/* ======================================================= */
/* DESKTOP NAV ITEM                                        */
/* ======================================================= */

function DesktopNavItem({ to, label, icon: Icon }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <NavLink
          to={to}
          className={({ isActive }) =>
            `
            flex flex-row items-center justify-center gap-2
            px-4 py-2 rounded-md text-sm font-medium
            transition-colors whitespace-nowrap
            ${
              isActive
                ? "bg-green-500/15 text-white dark:text-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.35)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }
          `
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="leading-none">{label}</span>
        </NavLink>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

/* ======================================================= */
/* ADMIN ITEM                                              */
/* ======================================================= */

function AdminItem({ to, label, icon: Icon }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        to={to}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </NavigationMenuLink>
  );
}

/* ======================================================= */
/* MOBILE NAV                                              */
/* ======================================================= */

function MobileNav({ isLoggedIn, role, email, logout }) {
  return (
    <div className="flex h-full flex-col gap-6">
      {isLoggedIn && (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
            <User className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium truncate">{email}</div>
        </div>
      )}

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <MobileNavItem key={item.to} {...item} />
        ))}

        {isLoggedIn &&
          AUTH_ITEMS.map((item) => (
            <MobileNavItem key={item.to} {...item} />
          ))}

        {role === "admin" && (
          <>
            <p className="mt-3 text-xs uppercase text-muted-foreground">
              Admin
            </p>
            {ADMIN_ITEMS.map((item) => (
              <MobileNavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {isLoggedIn ? (
        <Button variant="outline" className="mt-auto" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      ) : (
        <Button
          className="mt-auto"
          onClick={() => (window.location.href = "/login")}
        >
          Login
        </Button>
      )}
    </div>
  );
}

function MobileNavItem({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
