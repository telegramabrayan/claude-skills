"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { actions, store, useHydrated, useProgress } from "@/lib/store";
import { currentStreak, levelInfo } from "@/engine/progress/rules";
import { Icon } from "../ui/Icon";
import { Toaster } from "./Toaster";
import { isActive, NAV_MAIN, NAV_MOBILE, NAV_SECONDARY, type NavItem } from "./nav";

const BARE_ROUTES = ["/bienvenida"];

function useTheme() {
  const theme = useProgress().settings.theme;
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}

/** Cuenta tiempo de estudio real: pestaña visible y actividad en los últimos 90 s. */
function useStudyTimer() {
  useEffect(() => {
    let last = Date.now();
    const mark = () => (last = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const TICK = 15;
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - last < 90_000 && store.getState().profile.onboarded) actions.addStudyTime(TICK);
    }, TICK * 1000);
    return () => {
      clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, mark));
    };
  }, []);
}

function NavLink({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick?: () => void }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-medium transition ${active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
    >
      <Icon name={item.icon} size={20} />
      {item.label}
    </Link>
  );
}

function PlayerBadge() {
  const s = useProgress();
  const { level, into, needed } = levelInfo(s.xp);
  const streak = currentStreak(s);
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-warn" title="Racha de días">
        <Icon name="flame" size={16} /> {streak}
      </span>
      <span className="flex items-center gap-1 rounded-full bg-xp-soft px-2.5 py-1 text-xp" title={`${into} / ${needed} XP para el nivel ${level + 1}`}>
        <Icon name="star" size={16} /> Nv {level}
      </span>
    </div>
  );
}

function ThemeToggle() {
  const theme = useProgress().settings.theme;
  const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const label = theme === "dark" ? "Modo oscuro (tocar para claro)" : theme === "light" ? "Modo claro (tocar para automático)" : "Automático (tocar para oscuro)";
  return (
    <button className="btn btn-ghost !min-h-10 !px-2.5" onClick={() => actions.updateSettings({ theme: next })} aria-label={label} title={label}>
      <Icon name={theme === "dark" ? "moon" : theme === "light" ? "sun" : "sparkle"} size={20} />
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useProgress().profile.onboarded;
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    void store.hydrate();
  }, []);
  useTheme();
  useStudyTimer();

  useEffect(() => {
    if (hydrated && !onboarded && !BARE_ROUTES.includes(pathname)) router.replace("/bienvenida");
  }, [hydrated, onboarded, pathname, router]);

  useEffect(() => setMoreOpen(false), [pathname]);

  if (BARE_ROUTES.includes(pathname)) {
    return (
      <>
        <main className="mx-auto min-h-dvh max-w-2xl px-4 py-8">{children}</main>
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-2">
        Saltar al contenido
      </a>
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-1 overflow-y-auto border-r border-line bg-surface px-3 py-5 lg:flex" aria-label="Navegación principal">
        <Link href="/" className="mb-4 flex items-center gap-2 px-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-black text-on-primary">∫</span>
          <span className="text-xl font-black tracking-tight">Ingenia</span>
        </Link>
        <nav className="flex flex-col gap-0.5">
          {NAV_MAIN.map((i) => (
            <NavLink key={i.href} item={i} pathname={pathname} />
          ))}
        </nav>
        <div className="my-3 border-t border-line" />
        <nav className="flex flex-col gap-0.5" aria-label="Más secciones">
          {NAV_SECONDARY.map((i) => (
            <NavLink key={i.href} item={i} pathname={pathname} />
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-bg/85 px-4 py-2 backdrop-blur">
          <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Ingenia, inicio">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-black text-on-primary">∫</span>
            <span className="font-black">Ingenia</span>
          </Link>
          <Link href="/buscar" className="hidden min-h-10 max-w-md flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-muted hover:border-primary sm:flex lg:flex">
            <Icon name="search" size={18} /> Buscar materias, temas, fórmulas…
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/buscar" className="btn btn-ghost !min-h-10 !px-2.5 sm:hidden" aria-label="Buscar">
              <Icon name="search" size={20} />
            </Link>
            <PlayerBadge />
            <ThemeToggle />
          </div>
        </header>

        <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Navegación inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navegación">
        <div className="grid grid-cols-5">
          {NAV_MOBILE.map((i) => {
            const active = isActive(pathname, i.href);
            return (
              <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active ? "text-primary" : "text-muted"}`}>
                <Icon name={i.icon} size={22} />
                {i.label}
              </Link>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted" aria-expanded={moreOpen} aria-controls="menu-mas">
            <Icon name="menu" size={22} />
            Más
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Más secciones">
          <button className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} aria-label="Cerrar menú" />
          <div id="menu-mas" className="anim-pop absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="grid grid-cols-2 gap-1">
              {[...NAV_MAIN.filter((i) => !NAV_MOBILE.some((m) => m.href === i.href)), ...NAV_SECONDARY].map((i) => (
                <NavLink key={i.href} item={i} pathname={pathname} onClick={() => setMoreOpen(false)} />
              ))}
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
