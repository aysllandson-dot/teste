"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Star, 
  MessageSquare, 
  FileText,
  Settings,
  UsersRound
} from "lucide-react";

import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Funcionários", href: "/dashboard/employees", icon: Users },
    { name: "Avaliações", href: "/dashboard/evaluations", icon: Star },
    { name: "Equipes", href: "/dashboard/teams", icon: UsersRound },
    { name: "Comentários", href: "/dashboard/comments", icon: MessageSquare },
    { name: "Relatórios", href: "/dashboard/reports", icon: FileText },
  ];

  return (
    <aside className="w-72 sidebar-glass text-white flex flex-col h-full shrink-0 shadow-2xl z-20 hidden md:flex border-r border-white/10">
      <div className="h-40 flex items-center justify-center border-b border-white/10 px-6 py-8 overflow-hidden bg-black/10">
        <Link href="/dashboard" className="relative w-full h-full flex items-center justify-center z-10 transition-all duration-500 hover:scale-105 active:scale-95">
          <Image
            src="/images/Logo.png"
            alt="Viana & Moura"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-white/15 text-white font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-[var(--color-secondary)]" : "text-white/60"}`} />
              <span className="tracking-wide">{item.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] shadow-[0_0_10px_var(--color-secondary)]" />}
            </Link>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-white/10 bg-black/10">
        <Link 
          href="/dashboard/settings" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 group"
        >
          <Settings className="w-5 h-5 text-white/50 group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-medium">Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
