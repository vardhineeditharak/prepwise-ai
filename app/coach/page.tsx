"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { sanitizeInput } from "@/lib/security";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "How should I answer behavioral questions?",
  "What's the STAR method?",
  "How to answer 'What's your weakness?'",
  "Tips for technical interviews",
  "How to negotiate salary?",
  "Practice a product manager interview",
];

export default function CoachPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    const client = createClient();
    setSupabase(client);

    const init = async () => {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      const { data: profileData } = await client
        .from("profiles")
        .select("name, target_role, resume_text")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Load chat history
      const { data: history } = await client
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (history && history.length > 0) {
        setMessages(history);
      }
      setInitializing(false);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const userInitials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : user?.email ? user.email.slice(0, 2).toUpperCase() : "ME";

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const cleanContent = sanitizeInput(content).substring(0, 4000);
    if (!cleanContent) return;

    const userMessage: Message = { role: "user", content: cleanContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Save user message
    if (user && supabase) {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content: cleanContent,
      });
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          resumeContext: profile?.resume_text,
          role: profile?.target_role,
        }),
      });

      const data = await res.json();
      const finalContent = data.content;

      // Hide typing loader before streaming text
      setLoading(false);

      // Add empty assistant response to stream into
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const words = finalContent.split(" ");
      let currentText = "";
      let index = 0;

      const interval = setInterval(async () => {
        if (index < words.length) {
          currentText += (index === 0 ? "" : " ") + words[index];
          index++;
          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1].role === "assistant") {
              next[next.length - 1] = { role: "assistant", content: currentText };
            }
            return next;
          });
        } else {
          clearInterval(interval);
          // Save assistant message to DB after stream finishes
          if (user && supabase) {
            await supabase.from("chat_messages").insert({
              user_id: user.id,
              role: "assistant",
              content: finalContent,
            });
          }
        }
      }, 25); // 25ms per word is highly readable and feels alive
    } catch (err) {
      console.error("Chat error:", err);
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    }
  };

  const handleClearChat = async () => {
    if (!user || !supabase) return;
    await supabase
      .from("chat_messages")
      .delete()
      .eq("user_id", user.id);
    setMessages([]);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-48 rounded-xl bg-dove/30 mx-auto mb-3 shimmer-pulse" />
          <div className="h-4 w-64 rounded-lg bg-dove/20 mx-auto shimmer-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] sm:h-[calc(100dvh-64px)] bg-fog flex flex-col overflow-hidden animate-fade-in">
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-subheading font-medium text-ink">AI Interview Coach</h1>
            <p className="text-caption text-ash">
              {profile?.target_role
                ? `Preparing for: ${profile.target_role}`
                : "Ask me anything about interview preparation"}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-caption text-graphite hover:text-ink transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-5 mb-4 min-h-0 chat-scroll pr-1">
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-apricot-wash flex items-center justify-center mb-4 shadow-sm">
                <svg className="h-8 w-8 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-subheading font-medium text-ink mb-2">
                How can I help you prepare?
              </h2>
              <p className="text-body text-ash mb-8 max-w-sm">
                I can help with behavioral questions, technical interviews, salary
                negotiation, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="text-left rounded-2xl border border-dove/40 bg-pure-white px-4 py-3 text-caption text-ash hover:border-rust hover:text-ink hover:scale-[1.01] hover:shadow-sm active:scale-[0.99] transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-apricot-wash flex-shrink-0 flex items-center justify-center self-start shadow-sm mr-3">
                    <svg viewBox="0 0 24 24" className="h-5 w-5">
                      <rect x="4" y="7" width="16" height="11" rx="4" fill="white" />
                      <rect x="11" y="3" width="2" height="4" rx="1" fill="white" />
                      <circle cx="12" cy="3.5" r="1.5" fill="white" />
                      <rect x="1.5" y="10" width="2.5" height="5" rx="1.2" fill="white" />
                      <rect x="20" y="10" width="2.5" height="5" rx="1.2" fill="white" />
                      <ellipse cx="9" cy="12" rx="1.5" ry="2.5" fill="rgba(93,42,26,0.2)" />
                      <ellipse cx="15" cy="12" rx="1.5" ry="2.5" fill="rgba(93,42,26,0.2)" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-3xl px-5 py-4 ${
                    msg.role === "user"
                      ? "bg-ink text-pure-white shadow-md rounded-tr-sm"
                      : "bg-pure-white border border-dove/30 shadow-card text-ink rounded-tl-sm"
                  }`}
                >
                  <MarkdownText text={msg.content} isUser={msg.role === "user"} />
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-sky-wash flex-shrink-0 flex items-center justify-center text-[11px] font-medium text-ink self-start shadow-sm ml-3">
                    {userInitials}
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-apricot-wash flex-shrink-0 flex items-center justify-center mr-3 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <rect x="4" y="7" width="16" height="11" rx="4" fill="white" />
                  <rect x="11" y="3" width="2" height="4" rx="1" fill="white" />
                  <circle cx="12" cy="3.5" r="1.5" fill="white" />
                  <rect x="1.5" y="10" width="2.5" height="5" rx="1.2" fill="white" />
                  <rect x="20" y="10" width="2.5" height="5" rx="1.2" fill="white" />
                  <ellipse cx="9" cy="12" rx="1.5" ry="2.5" fill="rgba(93,42,26,0.2)" />
                  <ellipse cx="15" cy="12" rx="1.5" ry="2.5" fill="rgba(93,42,26,0.2)" />
                </svg>
              </div>
              <div className="bg-pure-white border border-dove/30 shadow-card rounded-3xl px-5 py-4 rounded-tl-sm">
                <div className="flex items-center gap-1.5 h-6">
                  <div className="w-2 h-2 rounded-full bg-rust/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-rust/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-rust animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-pure-white rounded-2xl shadow-card flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
                if (textareaRef.current) {
                  textareaRef.current.style.height = "auto";
                }
              }
            }}
            placeholder="Ask about interview preparation..."
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-body text-ink placeholder:text-dove focus:outline-none bg-transparent max-h-[120px]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-ink text-pure-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}

function MarkdownText({ text, isUser }: { text: string; isUser: boolean }) {
  // Split by line and parse basic structure
  const lines = text.split("\n");
  let inList = false;
  let inNumberedList = false;
  const listItems: string[] = [];
  const renderedElements: React.ReactNode[] = [];

  const parseInline = (line: string) => {
    // replace bold **word** and code `code`
    const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className={`font-semibold ${isUser ? "text-pure-white" : "text-ink"}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className={`px-1.5 py-0.5 rounded font-mono text-[13px] ${
              isUser ? "bg-pure-white/20 text-pure-white" : "bg-fog text-rust"
            }`}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const flushLists = (keyPrefix: string) => {
    if (listItems.length > 0) {
      if (inList) {
        renderedElements.push(
          <ul key={`ul-${keyPrefix}`} className="list-disc pl-5 my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className={isUser ? "text-pure-white" : "text-ash"}>
                {parseInline(item)}
              </li>
            ))}
          </ul>
        );
        inList = false;
      } else if (inNumberedList) {
        renderedElements.push(
          <ol key={`ol-${keyPrefix}`} className="list-decimal pl-5 my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className={isUser ? "text-pure-white" : "text-ash"}>
                {parseInline(item)}
              </li>
            ))}
          </ol>
        );
        inNumberedList = false;
      }
      listItems.length = 0;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      // Flush previous list if it was a different type
      if (inNumberedList) flushLists(index.toString());
      inList = true;
      listItems.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      // Flush previous list if it was a different type
      if (inList) flushLists(index.toString());
      inNumberedList = true;
      const match = trimmed.match(/^\d+\.\s(.*)/);
      listItems.push(match ? match[1] : trimmed);
    } else {
      flushLists(index.toString());
      if (trimmed.startsWith("### ")) {
        renderedElements.push(
          <h4
            key={index}
            className={`text-body-lg font-medium mt-3 mb-1 ${isUser ? "text-pure-white" : "text-ink"}`}
          >
            {parseInline(trimmed.slice(4))}
          </h4>
        );
      } else if (trimmed.startsWith("## ")) {
        renderedElements.push(
          <h3
            key={index}
            className={`text-subheading font-medium mt-4 mb-2 ${isUser ? "text-pure-white" : "text-ink"}`}
          >
            {parseInline(trimmed.slice(3))}
          </h3>
        );
      } else if (trimmed === "") {
        renderedElements.push(<div key={index} className="h-2" />);
      } else {
        renderedElements.push(
          <p
            key={index}
            className={`text-body leading-relaxed mb-2 ${isUser ? "text-pure-white/90" : "text-ash"}`}
          >
            {parseInline(line)}
          </p>
        );
      }
    }
  });

  flushLists("end");

  return <div className="space-y-1">{renderedElements}</div>;
}
