"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/overview", label: "Overview" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/compare", label: "Compare" },
  ];

  return (
    <div className="bg-[#0a1264] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-fit">
            <Image
              src="/moodys-ratings-logo.jpeg"
              alt="Moody's Analytics logo"
              width={60}
              height={60}
              className="w-8 sm:w-9 h-8 sm:h-9 rounded"
              priority
            />
            <div className="hidden sm:block">
              <div className="font-bold text-lg sm:text-xl text-white">Logo Colour Risk Model</div>
              <div className="text-xs text-gray-300">Moody's Analytics</div>
            </div>
            <div className="sm:hidden">
              <div className="font-bold text-base text-white">Risk Model</div>
            </div>
          </Link>

          <ul className="flex gap-0.5 sm:gap-1 ml-auto">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors rounded ${
                    pathname === item.href
                      ? "bg-[#005eff] text-white"
                      : "text-white hover:bg-[#1a2684]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-white border-b border-gray-200 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a1264]">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-2 text-sm sm:text-base">{description}</p>
        )}
      </div>
    </div>
  );
}
