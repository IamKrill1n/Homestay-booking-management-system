import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="h-[80px] bg-card border-t border-border px-[80px] flex items-center justify-center mt-auto">
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <Link to="/about" className="hover:text-foreground transition-colors">
          About
        </Link>
        <span className="text-border">|</span>
        <Link to="/terms" className="hover:text-foreground transition-colors">
          Terms
        </Link>
        <span className="text-border">|</span>
        <Link to="/privacy" className="hover:text-foreground transition-colors">
          Privacy
        </Link>
        <span className="text-border">|</span>
        <Link to="/contact" className="hover:text-foreground transition-colors">
          Contact
        </Link>
      </div>
    </footer>
  );
}
