"use client";
import { useState } from "react";
import Sidebar from "@/app/components/common/sidebar";
import Topbar from "@/app/components/common/topbar";
import Loader from "@/app/components/common/loader";
import { Bot, SendHorizonal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CopilotPage() {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([
    {
      role: "ai",
      message:
        "Hello Operator. I am ChainPulse Gemini Copilot. Ask me about live shipment risks, disruptions, or reroute recommendations."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async () => {
    if (!query.trim()) return;

    const userMessage = query;

    setChat((prev) => [...prev, { role: "user", message: userMessage }]);
    setQuery("");
    setLoading(true);

    console.log(userMessage)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/ai/copilot-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: userMessage
        })
      });

      const data = await res.json();
      console.log(data)

      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          message: data.aiResponse || "No AI response generated."
        }
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          message: "Backend AI connection failed."
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070816] via-[#0b0d23] to-[#120a2e] text-white">
      <Sidebar />

      <div className="lg:ml-[260px] pt-[72px] lg:pt-0">
        <Topbar title="Gemini Logistics Copilot" />

        <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-90px)] flex flex-col">

          {/* AI Header */}
          <div className="rounded-3xl bg-white/5 border border-white/5 p-5 mb-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/10">
              <Bot className="text-cyan-300 w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-cyan-300">
                ChainPulse Gemini Copilot
              </h2>
              <p className="text-gray-400 text-sm">
                AI-driven live supply chain diagnostics and decision assistance
              </p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 overflow-y-auto rounded-3xl bg-white/5 border border-white/5 p-4 sm:p-6 space-y-5">
            {chat.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[90%] sm:max-w-[75%] p-4 rounded-3xl ${
                  msg.role === "user"
                    ? "ml-auto bg-cyan-500/15 border border-cyan-400/10"
                    : "bg-purple-500/10 border border-purple-400/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {msg.role === "ai" ? (
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  ) : (
                    <SendHorizonal className="w-4 h-4 text-cyan-300" />
                  )}
                  <span className="text-xs text-gray-400 uppercase">
                    {msg.role === "ai" ? "Gemini AI" : "Operator"}
                  </span>
                </div>
                <p className="text-sm leading-6">{msg.message}</p>
              </motion.div>
            ))}

            {loading && <Loader text="Gemini analyzing live logistics intelligence..." />}
          </div>

          {/* Input */}
          <div className="mt-6 flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendQuery()}
              placeholder="Ask about critical shipments, delays, reroutes..."
              className="flex-1 bg-white/5 border border-cyan-500/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-cyan-400/30"
            />

            <button
              onClick={sendQuery}
              disabled={loading}
              className="px-6 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/25 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}