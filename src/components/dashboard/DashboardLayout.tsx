import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Header />
      <main className="flex-1 p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  </div>
);
