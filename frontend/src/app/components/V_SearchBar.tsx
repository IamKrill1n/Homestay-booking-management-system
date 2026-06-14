import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function V_SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') return;
    setSearchQuery(new URLSearchParams(location.search).get('q') || '');
  }, [location.pathname, location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/');
  };

  return (
    <form onSubmit={handleSearch} className="relative w-[400px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search homestays..."
        value={searchQuery}
        onChange={(e) => {
          const value = e.target.value;
          setSearchQuery(value);
          if (!value && location.pathname === '/' && location.search) {
            navigate('/');
          }
        }}
        className="pl-10 bg-input-background border-border"
      />
    </form>
  );
}
