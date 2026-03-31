import Image from "next/image";
import { User } from "lucide-react";

interface EmployeeAvatarProps {
  photoUrl?: string | null;
  fullName: string;
  size?: "sm" | "md" | "lg";
}

export default function EmployeeAvatar({ photoUrl, fullName, size = "md" }: EmployeeAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8"
  };

  if (photoUrl) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 flex-shrink-0`}>
        <Image
          src={photoUrl}
          alt={fullName}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Placeholder with initials or icon
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full bg-[var(--color-primary)]/10 dark:bg-blue-900/20 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] dark:text-blue-400 font-bold flex-shrink-0`}>
      {initials || <User className={iconSizes[size]} />}
    </div>
  );
}
