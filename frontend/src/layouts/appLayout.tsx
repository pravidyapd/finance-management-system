
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
