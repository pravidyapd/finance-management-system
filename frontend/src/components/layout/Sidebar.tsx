
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  CreditCard,
  ChartNoAxesCombined,
  Wallet,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Income", icon: ArrowDownToLine, path: "/income" },
  { label: "Expenses", icon: ArrowUpFromLine, path: "/expenses" },
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
  { label: "Reports", icon: ChartNoAxesCombined, path: "/reports" },
];

function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col self-start bg-slate-950 text-white">
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-800 px-6">
        <div className="rounded-lg bg-emerald-500 p-2">
          <Wallet size={22} />
        </div>

        <div>
          <h1 className="text-lg font-semibold">FinTrack</h1>
          <p className="text-xs text-slate-400">Finance Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-emerald-500 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
