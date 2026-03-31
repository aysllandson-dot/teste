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
    <aside className="w-72 bg-[#6D1414] text-white flex flex-col h-full shrink-0 shadow-xl z-20 hidden md:flex">
      <div className="h-40 flex items-center justify-center border-b border-white/5 px-2 py-6 overflow-hidden">
        <Link href="/dashboard" className="relative w-full h-full flex items-center justify-center z-10 transition-transform hover:scale-105">
          <Image
            src="/images/Logo.png"
            alt="Viana & Moura"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-[var(--color-secondary)] text-[var(--color-primary)] font-medium shadow-sm" 
                  : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[var(--color-primary)]" : "text-blue-200"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-blue-800/50">
        <Link 
          href="/dashboard/settings" 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800/50 transition-colors"
        >
          <Settings className="w-5 h-5 text-blue-200" />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
