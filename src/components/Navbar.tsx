import { Link } from 'react-router-dom';
import { Bone } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-14 px-6">
        <Link to="/" className="flex items-center gap-2">
          <Bone className="h-5 w-5 text-foreground" />
          <span className="font-display font-bold text-sm tracking-wider text-foreground">
            DINOPEDIA
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/" className="text-sm font-display tracking-wider text-foreground hover:text-primary transition-colors">
            Encyclopedia
          </Link>
          <Link to="/compare" className="text-sm font-display tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            Compare
          </Link>
          <Link to="/identify" className="text-sm font-display tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            Dino Identifier
          </Link>
        </div>
      </div>
    </nav>
  );
}
