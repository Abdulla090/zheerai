import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, HelpCircle, BookOpen, Info, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/", label: "سەرەتا", icon: Home },
  { href: "/projects", label: "پڕۆژە", icon: FolderOpen },
  { href: "/qa", label: "پرسیار", icon: HelpCircle },
  { href: "/blog", label: "بابەت", icon: BookOpen },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const profileItem = user
    ? { href: "/profile", label: "پرۆفایل", icon: User }
    : { href: "/login", label: "چوونەژوورەوە", icon: LogIn };

  const allItems = [...navItems, profileItem];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {allItems.map((item) => {
          const isActive =
            item.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={cn(
                "text-[10px] leading-tight",
                isActive ? "font-semibold" : "font-normal"
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default MobileBottomNav;
