import { useState } from "react";
import { X } from "lucide-react";

type AddDebtModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: number) => void;
};

export default function AddDebtModal({ isOpen, onClose, onAdd }: AddDebtModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && amount) {
      onAdd(name, parseFloat(amount));
      setName("");
      setAmount("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="panel w-full max-w-md p-6 bg-[var(--background)] m-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Debt</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Debtor Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-xl px-4 py-3 font-medium outline-none text-white focus:border-[var(--accent-green)] transition-colors"
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-xl px-4 py-3 font-medium outline-none text-white focus:border-[var(--accent-green)] transition-colors"
              placeholder="0.00"
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] text-black rounded-xl font-semibold transition-colors"
            >
              Save Debt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
