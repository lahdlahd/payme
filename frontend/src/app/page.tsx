"use client";

import { useEffect, useState } from "react";
import { Activity, Plus, Wallet } from "lucide-react";
import { ethers } from "ethers";
import DashboardStats from "@/components/DashboardStats";
import DebtCard, { Debt } from "@/components/DebtCard";
import ChatBox from "@/components/ChatBox";
import AddDebtModal from "@/components/AddDebtModal";
import PaymentModal from "@/components/PaymentModal";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function Home() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [account, setAccount] = useState<string>("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedPaymentDebt, setSelectedPaymentDebt] = useState<Debt | null>(null);

  const fetchDebts = async () => {
    try {
      const q = account ? `?address=${account}` : '';
      const res = await fetch(`${API_BASE}/debts${q}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Debt, b: Debt) => b.createdAt - a.createdAt);
        setDebts(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch debts:", error);
    }
  };

  useEffect(() => {
    fetchDebts();
    // Setting up polling for autonomous updates if backend marks it paid
    const timer = setInterval(fetchDebts, 15000);
    return () => clearInterval(timer);
  }, [account]);

  const totalOwed = debts.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
  const totalRecovered = debts.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
  const activeDebtsCount = debts.filter(d => d.status === 'pending').length;

  // Actions
  const handleAddDebt = async (name: string, amount: number) => {
    if (!account) {
      alert("Please Connect Wallet first to log this debt on X Layer!");
      return;
    }

    try {
      let txHash = "";
      
      // TRIGGER X LAYER TRANSACTION via METAMASK
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const tx = await signer.sendTransaction({
          to: account, // Sending 0 OKB locally to ourselves to embed the debt log!
          value: 0,
          data: ethers.hexlify(ethers.toUtf8Bytes(`Debt Log via PayMeBack: LENT ${name} $${amount}`))
        });
        txHash = tx.hash;
      } catch (err) {
        console.error("Wallet transaction rejected", err);
        alert("Transaction rejected! We must record the debt on-chain.");
        return;
      }

      const res = await fetch(`${API_BASE}/debts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ name, amount, creditorAddress: account, txHash })
      });
      if (!res.ok) {
        throw new Error("Backend response not OK");
      }
      fetchDebts();
    } catch (e) {
      console.error(e);
      alert("Error: Could not connect to the Backend! Make sure your tunnel is running and NEXT_PUBLIC_BACKEND_URL is updated.");
    }
  };

  const handleSendReminder = async (id: string) => {
    alert("On-chain/backend reminder triggered (Gentle or Urgent will be processed by Agent)!");
    // For MVP demo, hitting reminder endpoint
    try {
      await fetch(`${API_BASE}/reminder`, { 
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" }
      });
    } catch(e) {}
  };

  const handleSimulatePayment = async (id: string) => {
    try {
      await fetch(`${API_BASE}/simulate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ id })
      });
      setSelectedPaymentDebt(null);
      fetchDebts();
    } catch (e) {}
  };

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pay Me Back Agent <span className="text-[var(--accent-green)]">.</span></h1>
          <p className="text-zinc-400 mt-1">Your autonomous debt collection assistant.</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 bg-[#27272a] px-4 py-2 rounded-full border border-[#3f3f46]">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-green)]"></span>
            </span>
            Agent Active
          </div>
          <div className="w-[1px] h-4 bg-zinc-600"></div>
          {account ? (
            <div className="text-xs font-mono text-[var(--accent-green)] border border-[var(--accent-green)] px-3 py-1 rounded-full cursor-pointer hover:bg-[var(--accent-green)] hover:text-black transition-colors" onClick={() => setAccount("")}>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </div>
          ) : (
            <button 
              onClick={async () => {
                if ((window as any).ethereum) {
                  try {
                    const provider = new ethers.BrowserProvider((window as any).ethereum);
                    const accounts = await provider.send("eth_requestAccounts", []);
                    setAccount(accounts[0]);
                  } catch (e) { console.error(e); }
                } else { alert("MetaMask not found! Please install the extension."); }
              }}
              className="text-xs font-bold text-black bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] px-4 py-1.5 flex items-center rounded-full transition-colors shadow-lg shadow-green-500/20"
            >
              <Wallet className="w-3.5 h-3.5 mr-1.5" /> Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* DASHBOARD STATS */}
      <DashboardStats totalOwed={totalOwed} totalRecovered={totalRecovered} activeDebts={activeDebtsCount} />

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO COLUMNS: DEBTS */}
        <div className="lg:col-span-2 relative pb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[var(--accent-green)]" /> Output Log & Debts
            </h2>
          </div>

          {debts.length === 0 ? (
            <div className="panel p-12 text-center text-zinc-500 border-dashed border-2 bg-transparent">
              No debts yet. Chat with the agent or click Add to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map(debt => (
                <DebtCard 
                  key={debt.id} 
                  debt={debt} 
                  onSendReminder={handleSendReminder} 
                  onViewPayment={(d) => setSelectedPaymentDebt(d)} 
                />
              ))}
            </div>
          )}

          {/* FLOATING ACTION BUTTON */}
          <button 
            onClick={() => setAddModalOpen(true)}
            className="absolute bottom-4 right-4 md:bottom-0 shadow-2xl shadow-[var(--accent-green)] bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] transition-transform hover:scale-105 text-black px-6 py-4 rounded-full font-bold flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Debt
          </button>
        </div>

        {/* RIGHT COLUMN: CHAT */}
        <div className="lg:col-span-1">
          <ChatBox onAddDebt={handleAddDebt} onRefresh={fetchDebts} />
        </div>
      </div>

      <AddDebtModal 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onAdd={handleAddDebt} 
      />

      <PaymentModal 
        isOpen={selectedPaymentDebt !== null} 
        debt={selectedPaymentDebt} 
        onClose={() => setSelectedPaymentDebt(null)} 
        onSimulate={handleSimulatePayment} 
      />

    </main>
  );
}
