import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';
import Button from './ui/Button';

const Header = () => {
  const { session, profile, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold text-white">
          لومن<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
          ) : session && profile ? (
            <>
              {profile.role === 'teacher' && (
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                  <LayoutDashboard size={20} />
                  <span>لوحة التحكم</span>
                </Link>
              )}
              <span className="text-gray-400">أهلاً, {profile.full_name}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
                <LogOut size={20} />
                <span>خروج</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                تسجيل الدخول
              </Link>
              <Link to="/signup">
                <Button className="w-auto px-4 py-1.5 text-sm">
                  إنشاء حساب
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
