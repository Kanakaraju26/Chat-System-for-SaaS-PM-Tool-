import ChatInterface from "@/component/ChatInterface";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { Hash, MessageSquareQuote } from "lucide-react";

// --- Types ---
interface ChannelResult {
    id: string;
    type: 'organization' | 'project';
    projects: { name: string } | null;
    organizations: { name: string } | null;
}

interface ChatPageProps {
    params: Promise<{ 
        org_slug: string; 
        type: 'organization' | 'project'; 
        id: string 
    }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { type, id } = await params;
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // 2. Fetch Channel with Joined Data
    const { data, error } = await supabase
        .from('channels')
        .select(`
            id,
            type,
            projects!left (name),
            organizations!left (name)
        `)
        .eq(type === 'project' ? 'project_id' : 'organization_id', id)
        .eq('type', type)
        .single();

    // Cast the data to our interface
    const channel = data as unknown as ChannelResult;

    if (error || !channel) {
        return (
            <div className="flex flex-col items-center justify-center h-[100dvh] p-6 text-center bg-slate-50">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                   <p className="text-lg font-bold text-slate-900 mb-2">Channel not found</p>
                   <p className="text-sm text-slate-500 mb-6">This chat might have been deleted or moved.</p>
                   {/* Note: Server components can't have onClick. Use a Link or a Client Component for 'Go Back' */}
                </div>
            </div>
        );
    }

    // 3. Extract the Title Safely
    const channelName = type === 'project' 
        ? channel.projects?.name 
        : channel.organizations?.name;

    return (
        <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-white">
            
            {/* Mobile-Only Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 lg:hidden shrink-0">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    {type === 'project' ? <Hash size={18} /> : <MessageSquareQuote size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-slate-900 truncate pr-4">
                        {channelName || "Chat"}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {type}
                    </p>
                </div>
            </div>

            {/* Chat Interface Container */}
            <div className="flex-1 min-h-0 relative">
                <ChatInterface
                    chatId={channel.id}
                    userId={user.id}
                />
            </div>
        </div>
    );
}