import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

type Message = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
};

type ChatBoxProps = {
  onAddDebt: (name: string, amount: number) => void;
  onRefresh: () => void;
};

export default function ChatBox({ onAddDebt, onRefresh }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'agent', text: "Hello! I'm your Pay Me Back Agent. You can say 'I lent John $20' or 'list debts'." }
  ]);
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simple MVP NLP Parser
    setTimeout(() => {
      const lower = userMsg.text.toLowerCase();
      let responseText = "I didn't quite catch that. Try 'I lent Name $Amount' or 'check'.";

      if (lower.includes("lent") || lower.includes("gave")) {
        // Regex to find a name and amount, e.g., "lent John 20" or "lent John $20"
        const match = userMsg.text.match(/(?:lent|gave)\s+([A-Za-z]+).*?\$?(\d+(?:\.\d+)?)/i);
        if (match) {
          const name = match[1];
          const amount = parseFloat(match[2]);
          onAddDebt(name, amount);
          responseText = `Got it! I added a debt of $${amount} for ${name}. Track it on the dashboard.`;
        } else {
          responseText = "I saw you want to log a debt, but I couldn't read the name or amount. Use format: 'I lent John $20'.";
        }
      } else if (lower.includes("list") || lower.includes("debts")) {
        onRefresh();
        responseText = "I've refreshed the dashboard to show your latest debts!";
      } else if (lower.includes("check") || lower.includes("remind")) {
        responseText = "Checking for payments on X Layer and sending out reminders in the background!";
        // Could technically call the POST /reminder endpoint here too
      }

      const agentMsg: Message = { id: (Date.now() + 1).toString(), sender: 'agent', text: responseText };
      setMessages(prev => [...prev, agentMsg]);
    }, 800);
  };

  return (
    <div className="panel flex flex-col h-[500px] md:h-[600px]">
      <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center bg-[#18181b] rounded-t-2xl">
        <Bot className="w-5 h-5 mr-2 text-[var(--accent-green)]" />
        <h3 className="font-semibold text-lg">Agent Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.sender === 'user' 
                ? 'bg-[var(--accent-green)] text-black rounded-tr-sm' 
                : 'bg-[#27272a] text-[var(--foreground)] rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex items-center bg-[#27272a] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--accent-green)] transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type 'I lent John $50'..."
            className="flex-1 bg-transparent px-4 py-3 outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            className="px-4 py-3 bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] text-black transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
