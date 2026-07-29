import { Link, useLocation } from 'react-router-dom';
import { GlobalSearch } from '@/components/GlobalSearch';

export function Navbar() {
  const { pathname } = useLocation();

  const links: { to: string; label: string; hall: string }[] = [
    { to: '/',         label: 'Encyclopedia',   hall: 'I' },
    { to: '/compare',  label: 'Comparison Hall', hall: 'II' },
    { to: '/identify', label: 'Identification',  hall: 'III' },
  ];

  return (
    <nav className="fixed top-[34px] left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60">
      {/* Top gold hairline — the threshold of the museum */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

      <div className="max-w-[1480px] mx-auto flex items-center h-16 px-5 md:px-8 gap-6">
        {/* Museum emblem + wordmark */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/35 group-hover:border-amber-400/60 transition-colors">
            <span className="absolute inset-[3px] rounded-full border border-amber-400/15" />
            <span className="font-display font-bold text-[13px] leading-none text-amber-300/90 tracking-tight">D</span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display font-bold text-[15px] tracking-[0.22em] text-foreground">
              DINOPEDIA
            </span>
            <span className="mt-1 text-[7.5px] uppercase tracking-[0.34em] text-muted-foreground/55 font-display">
              Natural History Museum
            </span>
          </span>
        </Link>

        {/* Global search */}
        <GlobalSearch />

        {/* Wayfinding — museum halls */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
          {links.map(({ to, label, hall }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground/70 hover:text-foreground'
                }`}
              >
                <span className={`hidden md:inline text-[8px] font-mono tracking-[0.1em] transition-colors ${
                  active ? 'text-amber-400/70' : 'text-muted-foreground/35 group-hover:text-amber-400/50'
                }`}>
                  {hall}
                </span>
                <span className="text-[11px] font-display uppercase tracking-[0.18em] whitespace-nowrap">
                  {label}
                </span>
                <span className={`absolute -bottom-[1px] left-3 right-3 h-px bg-amber-400/60 transition-opacity ${
                  active ? 'opacity-100' : 'opacity-0'
                }`} />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
