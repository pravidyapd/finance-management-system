
import { Bell, Search, CircleUserRound, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const userData = sessionStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:flex">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-32 text-sm outline-none"
          />
        </div>

        <Bell size={20} className="cursor-pointer text-slate-500" />

        <div className="flex items-center gap-2">
          <CircleUserRound size={30} className="text-slate-500" />

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500">
              {user?.email || ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
