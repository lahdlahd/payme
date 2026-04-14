import { ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";

type DashboardStatsProps = {
  totalOwed: number;
  totalRecovered: number;
  activeDebts: number;
};

export default function DashboardStats({ totalOwed, totalRecovered, activeDebts }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="panel p-6 card-hover animate-fade-in flex flex-col justify-between" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center text-zinc-400 mb-2">
          <ArrowUpRight className="w-5 h-5 mr-2 text-[var(--warning-yellow)]" />
          <span className="text-sm font-medium uppercase tracking-wider">Total Money Owed</span>
        </div>
        <div className="text-4xl font-bold">
          ${totalOwed.toFixed(2)}
        </div>
      </div>

      <div className="panel p-6 card-hover animate-fade-in flex flex-col justify-between" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center text-zinc-400 mb-2">
          <CheckCircle2 className="w-5 h-5 mr-2 text-[var(--accent-green)]" />
          <span className="text-sm font-medium uppercase tracking-wider">Total Recovered</span>
        </div>
        <div className="text-4xl font-bold text-[var(--accent-green)]">
          ${totalRecovered.toFixed(2)}
        </div>
      </div>

      <div className="panel p-6 card-hover animate-fade-in flex flex-col justify-between" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center text-zinc-400 mb-2">
          <Clock className="w-5 h-5 mr-2 text-blue-400" />
          <span className="text-sm font-medium uppercase tracking-wider">Active Debts</span>
        </div>
        <div className="text-4xl font-bold">
          {activeDebts}
        </div>
      </div>
    </div>
  );
}
