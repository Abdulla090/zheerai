import { Bell, MessageSquare, FolderOpen, HelpCircle, BookOpen, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const typeIcon: Record<string, typeof Bell> = {
  new_question: HelpCircle,
  new_project: FolderOpen,
  new_blog: BookOpen,
  new_comment: MessageSquare,
};

const typeLabel: Record<string, string> = {
  new_question: "پرسیارێکی نوێ",
  new_project: "پڕۆژەیەکی نوێ",
  new_blog: "بابەتێکی نوێ",
  new_comment: "کۆمێنتێکی نوێ لەسەر",
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isSupported, isSubscribed, permission, loading, subscribe } = usePushNotifications();

  const handleClick = (id: string, link: string | null) => {
    markAsRead.mutate(id);
    if (link) navigate(link);
  };

  const showPushBanner = isSupported && !isSubscribed && permission !== "denied";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="ئاگادارییەکان">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" dir="rtl">
        {/* Push notification opt-in banner */}
        {showPushBanner && (
          <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-2.5">
            <BellRing className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">ئاگادارییەکان لەسەر مۆبایل وەربگرە</p>
            <Button
              variant="default"
              size="sm"
              className="h-7 text-xs"
              onClick={subscribe}
              disabled={loading}
            >
              {loading ? "..." : "چالاککردن"}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">ئاگادارییەکان</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllAsRead.mutate()}
            >
              هەمووی بخوێنەوە
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">هیچ ئاگادارییەک نییە</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = typeIcon[n.type] || Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n.id, n.link)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-right transition-colors hover:bg-accent/50",
                      !n.is_read && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      !n.is_read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="text-muted-foreground">{typeLabel[n.type] || n.type}</span>
                        {" "}
                        <span className="font-medium line-clamp-1">{n.title}</span>
                      </p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          لەلایەن {n.body}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: false })} پێش ئێستا
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
