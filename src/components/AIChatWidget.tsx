import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Sentinel AI, the intelligent assistant for a data center monitoring platform called DataCenter Sentinel. You help operators understand their infrastructure status, interpret alerts, suggest maintenance actions, and answer questions about data center operations. Be concise, technical, and actionable. Use data center terminology. If asked about specific sensor data or alerts, explain what the readings mean and what actions to take.`;

export const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello, Operator. I'm Sentinel AI — your data center intelligence assistant. Ask me about alerts, thermal analysis, maintenance recommendations, or any infrastructure question." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          systemPrompt: SYSTEM_PROMPT,
        },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "I apologize, I couldn't process that request." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-lg",
          open
            ? "bg-secondary text-foreground"
            : "bg-primary text-primary-foreground hover:scale-105"
        )}
        style={!open ? { boxShadow: "0 0 30px hsl(185 80% 50% / 0.4)" } : undefined}
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[380px] max-h-[520px] rounded-2xl border border-primary/20 bg-card shadow-2xl flex flex-col overflow-hidden"
          style={{ boxShadow: "0 0 40px hsl(185 80% 50% / 0.1)" }}>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Sentinel AI</p>
              <p className="text-[10px] text-muted-foreground font-mono">INTELLIGENT ASSISTANT</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-success font-mono">ONLINE</span>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-xl px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask about your infrastructure..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
