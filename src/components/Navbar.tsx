import { Link, useLocation } from 'react-router-dom';
import { Bone } from 'lucide-react';
import { GlobalSearch } from '@/components/GlobalSearch';

export function Navbar() {
  const { pathname } = useLocation();

  const navLink = (to: string, label: string) => {
    const active = pathname === to || (to === '/' && pathname === '/');
    return (
      <Link
        to={to}
        className={`text-sm font-display tracking-wider transition-colors whitespace-nowrap ${
          active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed top-[34px] left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto flex items-center h-14 px-6 gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <Bone className="h-5 w-5 text-foreground" />
          <span className="font-display font-bold text-sm tracking-wider text-foreground">
            DINOPEDIA
          </span>
        </Link>

        {/* Global search — grows to fill available space */}
        <GlobalSearch />

        {/* Nav links */}
        <div className="flex items-center gap-6 flex-shrink-0 ml-auto">
          {navLink('/', 'Encyclopedia')}
          {navLink('/compare', 'Compare')}
          {navLink('/identify', 'Dino Identifier')}
        </div>
      </div>
    </nav>
  );
}
