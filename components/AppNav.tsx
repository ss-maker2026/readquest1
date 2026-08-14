"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/bookshelf", label: "本棚", icon: "📚" },
  { href: "/character", label: "キャラクター", icon: "🎖️" },
] as const;

// 全画面共通の下部ナビゲーション。「今どこにいて、次にどこへ行けるか」を
// 常に一目でわかるようにする。LevelUpModalなどの全画面演出（z-50）より
// 手前に出ないよう、これ自体はz-40に抑えている。
export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-glow-gold/40 bg-black/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
                active
                  ? "text-glow-gold"
                  : "text-glow-gold/45 hover:text-glow-gold/75"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className={active ? "font-semibold" : ""}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
