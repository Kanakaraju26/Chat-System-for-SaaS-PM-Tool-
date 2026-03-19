// component/SidebarWrapper.tsx
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function SidebarWrapper({ 
  children, 
  orgSlug 
}: { 
  children: React.ReactNode, 
  orgSlug: string 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header Bar - Now showing the Org Slug */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-40 w-full">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen(true)} className="p-1 text-slate-600">
            <Menu size={24} />
          </button>
          {/* Displaying Org Slug here */}
          <span className="font-bold text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-700">
            {orgSlug}
          </span>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Container (Hidden on left for mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-slate-50 border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 flex justify-between items-center lg:hidden border-b bg-white">
           <span className="font-bold text-slate-900">Menu</span>
           <button onClick={() => setIsOpen(false)}><X size={20}/></button>
        </div>
        
        <div onClick={() => setIsOpen(false)} className="h-full flex flex-col">
          {children}
        </div>
      </aside>
    </>
  );
}