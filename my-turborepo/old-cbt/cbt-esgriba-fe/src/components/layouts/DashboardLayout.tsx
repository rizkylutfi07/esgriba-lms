import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function DashboardLayout() {
  const location = useLocation();
  const shouldHideChrome = /^\/tests\/[^/]+\/take$/.test(location.pathname);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Use min-h-screen + overflow-x-hidden to allow vertical scrolling while preventing horizontal scroll */}
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 no-print">
        <Sidebar />
      </div>

      {/* Main Content Area - With margin for fixed sidebar */}
      {/* min-h-0 ensures the inner scroll area can actually scroll within a flex container */}
      <div className="flex-1 flex flex-col lg:ml-72 min-h-0">
        {/* Header - fixed at top */}
        {!shouldHideChrome && (
          <div className="sticky top-0 z-30 no-print">
            <Header />
          </div>
        )}

        {/* Main Content - Scrollable */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 ${
            shouldHideChrome ? "pb-6" : "pb-24 lg:pb-6"
          }`}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {!shouldHideChrome && (
        <div className="no-print">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
