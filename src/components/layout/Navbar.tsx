"use client";

import { signOut, useSession } from "next-auth/react";
import { Menu, UserCircle, LogOut } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="h-20 md:h-16 bg-[#6D1414] md:bg-white dark:md:bg-slate-900 border-b border-blue-900/20 md:border-gray-200 md:dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shadow-sm z-10 sticky top-0 md:static">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-md hover:bg-white/10 text-white">
          <Menu className="w-6 h-6" />
        </button>
        <div className="md:hidden relative w-56 h-16">
          <Image
            src="/images/Logo.png"
            alt="Viana & Moura"
            fill
            className="object-contain"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {session.user.name || session.user.email}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] dark:text-gray-400">
                {(session.user as any).role || "Supervisor"}
              </span>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-[#6D1414]/10 dark:bg-blue-900/40 text-[#6D1414] dark:text-blue-400 flex items-center justify-center">
              <UserCircle className="w-6 h-6" />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 ml-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
