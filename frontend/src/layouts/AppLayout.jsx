import * as React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  User,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AppLayout() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role"); // "admin" | "user"
  const email = localStorage.getItem("email");

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="border-b bg-background/80 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">

          {/* MOBILE HAMBURGER */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="bg-card">
                <MobileNav
                  role={role}
                  email={email}
                  logout={logout}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex w-full items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/app/feed">Feed</NavLink>
                <NavLink to="/app/forum">Forum</NavLink>

                {/* Leaderboard */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    Leaderboard
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[220px] gap-3 p-4">
                      <NavItem to="/app/leaderboard">Global</NavItem>
                      <NavItem to="/app/leaderboard/week">This Week</NavItem>
                      <NavItem to="/app/leaderboard/month">This Month</NavItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Admin */}
                {role === "admin" && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      Admin
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[240px] gap-2 p-3">
                        <AdminItem
                          to="/app/admin"
                          icon={LayoutDashboard}
                          title="Dashboard"
                          desc="Overview & metrics"
                        />
                        <AdminItem
                          to="/app/admin/users"
                          icon={Users}
                          title="Users"
                          desc="Manage platform users"
                        />
                        <AdminItem
                          to="/app/admin/reports"
                          icon={FileText}
                          title="Reports"
                          desc="Moderation & logs"
                        />
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* RIGHT SIDE */}
            <div className="ml-auto flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-accent cursor-pointer">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm  font-medium">
                      {email}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">
                  <p className="text-xs">{email}</p>
                  {role === "admin" && (
                    <p className="text-xs text-muted-foreground">
                      Admin
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>

              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* PAGE CONTENT */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mx-auto max-w-7xl p-4"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function NavLink({ to, children }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        className={navigationMenuTriggerStyle()}
      >
        <Link to={to}>{children}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

function NavItem({ to, children }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className="block rounded-md p-2 text-sm font-medium hover:bg-accent"
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

function AdminItem({ to, icon: Icon, title, desc }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className="flex gap-3 rounded-md p-2 hover:bg-accent"
        >
          <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-muted-foreground">
              {desc}
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

function MobileNav({ role, email, logout }) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground">
          Signed in as
        </p>
        <p className="font-medium">{email}</p>
      </div>

      <nav className="flex flex-col gap-2">
        <MobileLink to="/">Home</MobileLink>
        <MobileLink to="/app/feed">Feed</MobileLink>
        <MobileLink to="/app/forum">Forum</MobileLink>
        <MobileLink to="/app/leaderboard">Leaderboard</MobileLink>

        {role === "admin" && (
          <>
            <p className="mt-4 text-xs text-muted-foreground uppercase">
              Admin
            </p>
            <MobileLink to="/app/admin">Dashboard</MobileLink>
            <MobileLink to="/app/admin/users">Users</MobileLink>
            <MobileLink to="/app/admin/reports">Reports</MobileLink>
          </>
        )}
      </nav>

      <Button
        variant="outline"
        className="mt-auto"
        onClick={logout}
      >
        Logout
      </Button>
    </div>
  );
}

function MobileLink({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
    >
      {children}
    </Link>
  );
}
