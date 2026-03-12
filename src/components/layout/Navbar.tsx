import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "سەرەتا" },
  { href: "/projects", label: "پڕۆژەکان" },
  { href: "/qa", label: "پرسیار و وەڵام" },
  { href: "/blog", label: "بڵاوکراوەکان" },
  { href: "/about", label: "دەربارەی ئێمە" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 md:bg-background/80 md:backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">Kurdistan AI</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-primary font-semibold bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 right-2 left-2 h-[2px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="گەڕان">
            <Search className="h-4 w-4" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-3.5 w-3.5" />
                  {user.user_metadata?.full_name || "پرۆفایل"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-3.5 w-3.5 ml-2" />
                  پرۆفایل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-3.5 w-3.5 ml-2" />
                  دەرچوون
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">چوونەژوورەوە</Link>
            </Button>
          )}
        </div>

        {/* Mobile: only show theme toggle and logo, nav is in bottom bar */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
