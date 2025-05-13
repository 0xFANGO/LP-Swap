import { Bell, BellOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "./components/ui/progress";

// 模拟通知数据
const notifications = [
  // 如果需要显示空状态，可以将此数组设置为空 []
  {
    id: 1,
    title: (
      <div className="flex items-center justify-between">
        <div>
          SOL-USDC <span className="text-xs">167.23-167.25</span>{" "}
        </div>
        <ExternalLink
          onClick={() => {
            window.open(`https://solscan.io/token/`, "_blank");
          }}
          className="w-3.5 h-3.5 cursor-pointer text-gray-400  hover:text-white "
        />
      </div>
    ),
    description: (
      <>
        Sell <span className="text-white">11000</span> SOL for{" "}
        <span className="text-white">167250</span> USDC
      </>
    ),
    percent: 80,
    isUnread: true,
  },
  {
    id: 2,
    title: "Your order has shipped!",
    description: "Order #12345 is on its way",
    percent: 20,
    isUnread: true,
  },
  {
    id: 3,
    title: "Welcome to our platform!",
    description: "Thanks for joining. Get started by...",
    percent: 30,
    isUnread: true,
  },
  {
    id: 4,
    title: "Welcome to our platform!",
    description: "Thanks for joining. Get started by...",
    percent: 50,
    isUnread: false,
  },
];
// const notifications = [ ];
export function Notifications() {
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Card className="border-none shadow-none">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-base">Positions</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-8rem)] overflow-auto p-0 scrollbar">
            {notifications.length > 0 ? (
              <div className="flex flex-col divide-y">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    title={notification.title}
                    description={notification.description}
                    percent={notification.percent}
                    isUnread={notification.isUnread}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <BellOff className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-sm font-medium">No notifications</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        When you have notifications, they'll show up here.
      </p>
    </div>
  );
}

interface NotificationItemProps {
  title: string | JSX.Element;
  description: string | JSX.Element;
  percent: number;
  isUnread?: boolean;
}

function NotificationItem({
  title,
  description,
  percent,
  isUnread,
}: NotificationItemProps) {
  return (
    <div className={`flex gap-4 p-4 ${isUnread ? "bg-muted/50" : ""}`}>
      <div className="flex-1 space-y-1">
        <p className={`text-sm ${isUnread ? "font-medium" : ""}`}>{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Progress value={80} className="mt-2 w-2/3" />
        <p className="text-xs text-muted-foreground">{percent}% USDC Swapped</p>
      </div>
      {isUnread && <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />}
    </div>
  );
}
