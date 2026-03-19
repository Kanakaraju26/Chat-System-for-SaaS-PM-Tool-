import ChatInterface from "@/component/ChatInterface";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { Hash, MessageSquareQuote } from "lucide-react";

export default async function ChatPage({
    params
}: {
    params: Promise<{ org_slug: string; type: 'organization' | 'project'; id: string }>
}) {
    const { type, id } = await params;
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // 2. Find channel AND the name of the entity (Project/Org) for the header
    // We join with projects or organizations to get a nice title for mobile users
    const query = supabase
        .from('channels')
        .select(`
            id,
            type,
            projects (name),
            organizations (name)
        `)
        .eq(type === 'project' ? 'project_id' : 'organization_id', id)
        .eq('type', type)
        .single();

    const { data: channel, error } = await query;

    if (error || !channel) {
        return (
            <div className="flex flex-col items-center justify-center h-[100dvh] p-6 text-center bg-slate-50">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                   <p className="text-lg font-bold text-slate-900 mb-2">Channel not found</p>
                   <p className="text-sm text-slate-500 mb-6">This chat might have been deleted or moved.</p>
                   <button onClick={() => window.history.back()} className="text-indigo-600 font-semibold text-sm">
                      Go Back
                   </button>
                </div>
            </div>
        );
    }

    // Determine the title to show in the mobile header
    const channelName = type === 'project' 
        ? (channel.projects as any)?.name 
        : (channel.organizations as any)?.name;

    return (
        // h-[100dvh] is key for mobile to prevent the address bar from cutting off the input
        <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-white">
            
            {/* Mobile-Only Secondary Header */}
            {/* This gives context: "# Project Alpha" or "General Chat" */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 lg:hidden">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    {type === 'project' ? <Hash size={18} /> : <MessageSquareQuote size={18} />}
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                        {channelName || "Chat"}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {type}
                    </p>
                </div>
            </div>

            {/* Chat Interface - flex-1 ensures it takes the remaining height */}
            <div className="flex-1 min-h-0 relative">
                <ChatInterface
                    chatId={channel.id}
                    userId={user.id}
                />
            </div>
        </div>
    )
}