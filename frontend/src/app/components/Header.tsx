import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { V_SearchBar } from './V_SearchBar';

export function Header() {
  const { user, logout, isAuthenticated, hasRole } = useAuth();

  return (
    <header className="h-[72px] bg-card border-b border-border px-[80px] flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-semibold text-primary">
          Homestay
        </Link>
        
        <V_SearchBar />
      </div>

      <nav className="flex items-center gap-6">
        <Link to="/" className="text-sm hover:text-primary transition-colors">
          Home
        </Link>
        
        {isAuthenticated && hasRole('user') && (
          <Link to="/my-bookings" className="text-sm hover:text-primary transition-colors">
            My Bookings
          </Link>
        )}
        
        {hasRole('owner') && (
          <Link to="/my-homestays" className="text-sm hover:text-primary transition-colors">
            My Homestays
          </Link>
        )}
        
        {hasRole('admin') && (
          <Link to="/admin" className="text-sm hover:text-primary transition-colors">
            Admin Panel
          </Link>
        )}

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm hover:text-primary transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity"
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}