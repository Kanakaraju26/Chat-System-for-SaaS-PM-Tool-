"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string, 
  icon: React.ReactNode, 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
          : "text-slate-600 hover:bg-white hover:text-indigo-600"
      }`}
    >
      <span className={isActive ? "text-white" : "text-slate-400"}>
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </Link>
  );
}