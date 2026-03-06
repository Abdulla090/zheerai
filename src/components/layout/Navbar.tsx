import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">ZHEERAI</span>
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

        <div className="hidden items-center gap-3 md:flex">
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

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="مینیو"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile slide-in sheet from the right (matches RTL layout) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72 p-0 border-r-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="text-right text-lg font-bold text-primary">ZHEERAI</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-[0_2px_0_0_hsl(270_70%_28%),0_3px_6px_-2px_rgba(0,0,0,0.2)]"
                      : "text-muted-foreground hover:bg-accent/80 hover:text-foreground hover:translate-x-[-2px]"
                  }`}
                >
                  {link.label}
                  {!isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 h-0 w-[3px] rounded-full bg-primary transition-all duration-200 group-hover:h-5" />
                  )}
                </Link>
              );
            })}
            <div className="mt-3 border-t border-border pt-4 space-y-2">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => { setMobileOpen(false); navigate("/profile"); }}>
                    <User className="h-3.5 w-3.5 ml-2" />
                    پرۆفایل
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-center text-muted-foreground" onClick={() => { setMobileOpen(false); handleSignOut(); }}>
                    <LogOut className="h-3.5 w-3.5 ml-2" />
                    دەرچوون
                  </Button>
                </>
              ) : (
                <Button className="w-full" size="sm" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>چوونەژوورەوە</Link>
                </Button>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Navbar;
