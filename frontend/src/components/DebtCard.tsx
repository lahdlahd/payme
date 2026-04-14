import { Bell, QrCode } from "lucide-react";

export type Debt = {
  id: string;
  name: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: number;
  walletAddress: string;
};

type DebtCardProps = {
  debt: Debt;
  onSendReminder: (id: string) => void;
  onViewPayment: (debt: Debt) => void;
};

export default function DebtCard({ debt, onSendReminder, onViewPayment }: DebtCardProps) {
  const isPaid = debt.status === 'paid';
  const dateStr = new Date(debt.createdAt).toLocaleDateString();

  return (
    <div className="panel p-5 card-hover mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div className="flex items-center mb-4 md:mb-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-4 ${isPaid ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' : 'bg-[var(--warning-yellow)]/20 text-[var(--warning-yellow)]'}`}>
          {debt.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{debt.name}</h3>
          <div className="text-zinc-400 text-sm">{dateStr}</div>
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end w-full md:w-auto">
        <div className="flex items-center mb-3">
          <span className="text-2xl font-bold mr-4">${debt.amount.toFixed(2)}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${isPaid ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]' : 'bg-[var(--warning-yellow)]/20 text-[var(--warning-yellow)]'}`}>
            {debt.status}
          </span>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {!isPaid && (
            <button 
              onClick={() => onSendReminder(debt.id)}
              className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] transition-colors rounded-lg text-sm font-medium"
            >
              <Bell className="w-4 h-4 mr-2" />
              Reminder
            </button>
          )}
          <button 
            onClick={() => onViewPayment(debt)}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] text-black transition-colors rounded-lg text-sm font-medium"
          >
            <QrCode className="w-4 h-4 mr-2" />
            {isPaid ? "View Receipt" : "View Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
