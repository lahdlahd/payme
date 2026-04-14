import { useState } from "react";
import { X, Send } from "lucide-react";
import { Debt } from "./DebtCard";

type ReminderModalProps = {
  isOpen: boolean;
  debt: Debt | null;
  onClose: () => void;
  onSend: (id: string, email: string) => Promise<void>;
};

export default function ReminderModal({ isOpen, debt, onClose, onSend }: ReminderModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !debt) return null;

  const handleSend = async () => {
    if (!email.includes("@")) return;
    setIsSending(true);
    await onSend(debt.id, email);
    setIsSending(false);
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#18181b] border border-[var(--border-color)] p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-2">Dispatch Agent</h2>
        <p className="text-zinc-400 text-sm mb-6">
          The Agent will dispatch a formal debt collection email requesting exactly <strong className="text-[var(--accent-green)]">${debt.amount}</strong> for <strong>{debt.name}</strong>.
        </p>

        <label className="block text-sm font-medium text-zinc-300 mb-2">Debtor's Email Address</label>
        <input 
          type="email" 
          placeholder="debtor@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-[#27272a] border border-[#3f3f46] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--accent-green)] transition-all mb-6 text-sm"
        />

        <button 
          onClick={handleSend}
          disabled={!email || isSending}
          className="w-full bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {isSending ? (
            <span className="flex items-center"><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div> Transmitting...</span>
          ) : (
            <span className="flex items-center"><Send className="w-4 h-4 mr-2"/> Send Autonomous Reminder</span>
          )}
        </button>
      </div>
    </div>
  );
}
