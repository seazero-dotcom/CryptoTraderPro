import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  BarChart3, 
  Bot, 
  Wallet, 
  Settings 
} from "lucide-react";

const navigation = [
  { name: "대시보드", href: "/", icon: TrendingUp },
  { name: "마켓", href: "/markets", icon: BarChart3 },
  { name: "전략", href: "/strategies", icon: Bot },
  { name: "포트폴리오", href: "/portfolio", icon: Wallet },
  { name: "설정", href: "/settings", icon: Settings },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:left-0 md:bottom-auto md:w-64 bg-card border-t md:border-r border-border z-50">
      <div className="flex md:flex-col h-16 md:h-full">
        {/* Desktop Logo */}
        <div className="hidden md:flex items-center px-6 py-4 border-b border-border">
          <TrendingUp className="text-primary text-xl mr-3" />
          <span className="font-bold text-lg">바이낸스 트레이더</span>
        </div>
        
        {/* Navigation Items */}
        <div className="flex md:flex-col flex-1 md:py-4">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start px-2 md:px-6 py-3 md:py-3 text-xs md:text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="text-lg md:text-base md:mr-3" />
                <span className="mt-1 md:mt-0">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
