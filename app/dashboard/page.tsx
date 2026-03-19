import Link from "next/link";
import { Briefcase, ChevronRight, LayoutGrid } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select(`
      role,
      organizations (
        id,
        name,
        slug,
        plan
      )
    `)
    .eq("user_id", user.id)
    .is('deleted_at', null) // Fixed: query should be null (no quotes)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-6 text-red-500 text-center">Error loading workspaces.</div>;
  }

  return (
    // Added 'pb-20' for mobile bottom-spacing and smoother scrolling
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-12 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section: Adjusted for mobile stacking */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="bg-indigo-600 p-3 rounded-xl text-white w-fit shadow-lg shadow-indigo-100">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              Your Workspaces
            </h1>
            <p className="text-slate-500 text-sm max-w-[250px] sm:max-w-none">
              {user.email}
            </p>
          </div>
        </div>

        {memberships?.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 text-center">
            <p className="text-slate-600 font-medium mb-6">You aren't a member of any organizations yet.</p>
            <Link 
              href="https://taskflowtool.vercel.app/dashboard" 
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-95"
            >
              Join via PM Tool
            </Link>
          </div>
        ) : (
          /* Grid: 1 col on mobile, 2 cols on tablet+ */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberships?.map((item: any) => (
              <Link
                key={item.organizations.id}
                href={`/${item.organizations.slug}/chat/organization/${item.organizations.id}`}
                /* Mobile touch improvement: Added active:bg-slate-50 and min-h-[100px] */
                className="group bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl hover:border-indigo-500 active:bg-slate-50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  {/* Icon: Slightly smaller on mobile */}
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Briefcase size={22} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-900 truncate pr-2">
                      {item.organizations.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">
                      {item.role} • {item.organizations.plan}
                    </p>
                  </div>
                </div>
                <ChevronRight 
                  className="text-slate-300 group-hover:text-indigo-500 flex-shrink-0 transition-transform group-hover:translate-x-1" 
                  size={20} 
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}