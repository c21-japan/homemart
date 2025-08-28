import React from "react";

const NAV = [
  { label: "会社を知る", href: "#about", color: "bg-primary text-white" },
  { label: "環境を知る", href: "#office", color: "bg-blue-500 text-white" },
  { label: "仕事を知る", href: "#works", color: "bg-orange-500 text-white" },
  { label: "人を知る", href: "#voices", color: "bg-purple-500 text-white" },
  { label: "採用について", href: "#cta", color: "bg-teal-500 text-white" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/c21-logo.png" alt="センチュリー21 ロゴ" className="h-8 w-auto" />
          <span className="text-lg font-bold text-[#383635]">センチュリー21ホームマート</span>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${n.color}`}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
