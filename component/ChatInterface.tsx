"use client";

import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/client";

export default function ChatInterface({ chatId, userId }: { chatId: string, userId: string }) {
    const supabase = createClient();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch initial messages & Setup Realtime
    // 1. Fetch initial messages & Setup Realtime
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select(`
                id,
                content,
                created_at,
                sender_id,
                users(email)
            `)
                .eq("channel_id", chatId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error);
                return;
            }
            if (data) setMessages(data);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat:${chatId}`) // Dynamic channel name is better
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `channel_id=eq.${chatId}`
                },
                async (payload) => { // <--- Added 'async' here!
                    // Fetch the profile for the new message sender
                    const { data: userData } = await supabase
                        .from('users')
                        .select('email')
                        .eq('id', payload.new.sender_id)
                        .single();

                    const newMessageWithProfile = {
                        ...payload.new,
                        users: userData // Changed from 'profiles' to 'users' to match your JSX
                    };

                    setMessages((prev) => [...prev, newMessageWithProfile]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId, supabase]);
    // 2. Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // 3. Send Message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const { error } = await supabase
            .from("messages")
            .insert({
                content: newMessage,
                sender_id: userId,
                channel_id: chatId
            });

        if (error) {
            console.error("Failed to send:", error.message);
        } else {
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Message Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender_id === userId ? "items-end" : "items-start"}`}
                    >
                        <span className="text-[10px] text-slate-400 mb-1">
                            {msg.users?.email || 'System'}
                        </span>
                        <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${msg.sender_id === userId
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-slate-100 text-slate-800 rounded-tl-none"
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}