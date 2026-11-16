
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  amount: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
}

function StatCard({
  title,
  amount,
  description,
  icon: Icon,
  iconColor,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-lg p-2 ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>

      <h2 className="mt-4 text-2xl font-bold text-slate-800">
        {amount}
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default StatCard;
