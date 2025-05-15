'use client';

import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect, useCallback } from "react";
import { FiEdit } from "react-icons/fi";  // ใช้ไอคอนจาก react-icons

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

const ChatBubble = ({
  sender,
  text,
  onEdit,
}: {
  sender: "user" | "ai";
  text: string;
  onEdit: () => void;
}) => (
  <div
    className={`inline-block px-4 py-3 rounded-xl text-sm shadow-md whitespace-pre-wrap break-words overflow-hidden relative ${
      sender === "user"
        ? "ml-auto bg-blue-600 text-white text-right"
        : "mr-auto bg-gray-700 text-gray-100 text-left"
    }`}
    style={{ maxWidth: "75%" }}
  >
    <div className="flex flex-col justify-between h-full"> {/* ใช้ flexbox เพื่อจัดตำแหน่งข้อความและไอคอน */}
      <div>{text}</div>
      {sender === "user" && (  // แสดงไอคอน edit เฉพาะข้อความของผู้ใช้
        <button
          onClick={onEdit}
          className="mt-2 text-gray-300 hover:text-gray-100 self-center"  // เพิ่ม margin ด้านบนเพื่อให้ไอคอนห่างจากข้อความ
        >
          <FiEdit />
        </button>
      )}
    </div>
  </div>
);

const ChatInput = ({
  input,
  setInput,
  onSend,
  loading,
}: {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
}) => (
  <div className="p-4 border-t border-white/10 bg-black/30 backdrop-blur-sm flex">
    <textarea
      rows={1}
      placeholder="พิมพ์ข้อความ..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSend();
        }
      }}
      className="flex-1 resize-none px-4 py-2 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none"
      disabled={loading}
    />
    <button
      onClick={onSend}
      disabled={loading}
      className="ml-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "..." : "ส่ง"}
    </button>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null); // สำหรับการแก้ไขข้อความ
  const chatEndRef = useRef<HTMLDivElement>(null);

const sendMessage = useCallback(async () => {
  if (!input.trim() || loading) return;

  const userMsg: Message = {
    id: editingMessageId || crypto.randomUUID(), // ใช้ id เดิมถ้าเป็นการแก้ไขข้อความ
    sender: "user",
    text: input,
  };

  setMessages((prev) => {
    if (editingMessageId) {
      // ถ้าเป็นการแก้ไขข้อความ, เปลี่ยนข้อความเดิม
      return prev.map((msg) =>
        msg.id === editingMessageId ? { ...msg, text: input } : msg
      );
    } else {
      // ถ้าไม่ใช่การแก้ไข, เพิ่มข้อความใหม่
      return [...prev, userMsg];
    }
  });

  setInput("");
  setLoading(true);

  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg.text }),
    });

    const data = await res.json();

    const aiReply: Message = {
      id: crypto.randomUUID(),
      sender: "ai",
      text: data?.reply || "⚠️ ไม่สามารถตอบได้",
    };

    setMessages((prev) => [...prev, aiReply]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: "ai", text: "❌ เกิดข้อผิดพลาด" },
    ]);
  } finally {
    setLoading(false);
    setEditingMessageId(null);  // รีเซ็ต editingMessageId หลังส่งข้อความใหม่
  }
}, [input, loading, editingMessageId]);

const handleEdit = (messageId: string) => {
  const messageToEdit = messages.find((msg) => msg.id === messageId);
  if (messageToEdit) {
    setInput(messageToEdit.text); // ใส่ข้อความที่ต้องการแก้ไข
    setEditingMessageId(messageId); // ตั้งค่าให้เป็นการแก้ไขข้อความ
  }
};

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-900 via-black to-gray-800 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl h-[95vh] flex flex-col rounded-3xl border border-white/10 backdrop-blur-md bg-white/5 shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <ChatBubble
                sender={msg.sender}
                text={msg.text}
                onEdit={() => handleEdit(msg.id)}  // คลิกเพื่อแก้ไขข้อความ
              />
            </div>
          ))}

          {loading && (
            <div className="mr-auto bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm animate-pulse max-w-fit">
              กำลังพิมพ์...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          loading={loading}
        />
      </div>
    </main>
  );
}
