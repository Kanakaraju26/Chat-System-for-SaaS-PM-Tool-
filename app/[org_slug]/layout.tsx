import SidebarWrapper from "@/component/SidebarWrapper";
import { createClient } from "@/lib/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MessageSquareQuote, Hash } from "lucide-react";
import NavLink from "@/component/NavLink";

export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org_slug: string }>;
}) {
  const { org_slug } = await params;
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch Organization Details by Slug
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", org_slug)
    .single();

  if (!org) return notFound();

  // 3. Fetch Projects where the user is a member within THIS org
  const { data: projectMemberships } = await supabase
    .from("project_members")
    .select(`
      project_id,
      projects!inner (
        id,
        name,
        organization_id
      )
    `)
    .eq("user_id", user.id)
    .eq("projects.organization_id", org.id) 
    .is("deleted_at", null);

  return (
    <div className="flex h-[100dvh] flex-col lg:flex-row overflow-hidden">
      
      {/* 1. Sidebar Wrapper (Now containing the Navigation UI) */}
      <SidebarWrapper orgSlug={org_slug}>
        {/* --- Back to Dashboard --- */}
        <div className="p-4 border-b border-slate-200 bg-white/50">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-4">
            <ChevronLeft size={14} /> Workspaces
          </Link>
          <h2 className="font-bold text-slate-900 truncate">{org.name}</h2>
        </div>

        {/* --- Sidebar Navigation Links --- */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6 no-scrollbar">
          {/* Organization General Section */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Organization
            </h3>
            <NavLink 
              href={`/${org.slug}/chat/organization/${org.id}`} 
              icon={<MessageSquareQuote size={18} />}
            >
              General Chat
            </NavLink>
          </div>

          {/* Projects Section */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Your Projects
            </h3>
            <div className="space-y-1">
              {projectMemberships?.map((membership: any) => (
                <NavLink
                  key={membership.project_id}
                  href={`/${org.slug}/chat/project/${membership.project_id}`}
                  icon={<Hash size={18} />}
                >
                  {membership.projects?.name || "Unnamed Project"}
                </NavLink>
              ))}
              
              {(!projectMemberships || projectMemberships.length === 0) && (
                <p className="px-3 text-xs text-slate-400 italic">No projects found.</p>
              )}
            </div>
          </div>
        </nav>

        {/* --- User Profile Footer --- */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                {user.email?.charAt(0)}
             </div>
             <div className="truncate text-[11px] font-medium text-slate-600">
                {user.email}
             </div>
          </div>
        </div>
      </SidebarWrapper>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* The Chat Page Content (children) */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}