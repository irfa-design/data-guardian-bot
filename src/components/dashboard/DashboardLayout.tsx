import { AppSidebar } from "./AppSidebar";
import { LiveHeader } from "./LiveHeader";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "@/components/CommandPalette";
import { AIChatWidget } from "@/components/AIChatWidget";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-background">
    <div className="hidden lg:block">
      <AppSidebar />
    </div>
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center lg:block">
        <div className="lg:hidden p-2">
          <MobileNav />
        </div>
        <div className="flex-1">
          <LiveHeader />
        </div>
      </div>
      <main className="flex-1 p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
    <CommandPalette />
    <AIChatWidget />
  </div>
);
