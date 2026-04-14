import { X, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Debt } from "./DebtCard";

type PaymentModalProps = {
  isOpen: boolean;
  debt: Debt | null;
  onClose: () => void;
  onSimulate: (id: string) => void;
};

export default function PaymentModal({ isOpen, debt, onClose, onSimulate }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !debt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(debt.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="panel w-full max-w-md p-6 bg-[var(--background)] m-4 shadow-2xl relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-2 uppercase text-[var(--accent-green)] text-xs font-bold tracking-widest mt-2 hover:animate-pulse">
          X Layer Network
        </div>
        <h2 className="text-2xl font-bold mb-6">Payment Request</h2>

        <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-inner animate-fade-in delay-150">
          {/* Mock QR Code Pattern directly with CSS to avoid slow payload dependencies */}
          <div className="w-48 h-48 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ethereum:payme')] bg-contain mx-auto opacity-90 filter grayscale">
             {/* If real QR needed, we can use a library, but placeholder works for hackathon */}
          </div>
        </div>

        <p className="text-zinc-300 text-sm mb-2">Send exactly <strong className="text-white text-lg">${debt.amount.toFixed(2)}</strong> to:</p>
        
        <div className="flex items-center justify-between bg-[#27272a] rounded-xl p-3 mb-6">
          <code className="text-xs text-[var(--accent-green)] truncate flex-1 text-left">
            {debt.walletAddress || "0x123...abc (Loading)"}
          </code>
          <button onClick={handleCopy} className="ml-3 text-zinc-400 hover:text-white transition-colors">
            {copied ? <CheckCircle2 className="w-5 h-5 text-[var(--accent-green)]" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {debt.status === 'pending' ? (
          <button
            onClick={() => onSimulate(debt.id)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors mt-2"
          >
            Demo: Simulate Payment Received
          </button>
        ) : (
          <div className="w-full py-3 bg-[var(--accent-green)]/20 text-[var(--accent-green)] rounded-xl font-semibold border border-[var(--accent-green)] mt-2">
            Fully Paid! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
