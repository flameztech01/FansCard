import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, CreditCard, Home } from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
  picture?: string;
  sub?: string;
}

const DashboardNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('userInfo');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Simple navigation - just home/buy cards and my cards
  const navLinks = [
    { name: 'Buy Cards', href: '/dashboard', icon: Home },
    { name: 'My Cards', href: '/dashboard/cards', icon: CreditCard },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
          >
            FanCardStore
          </Link>

          {/* Desktop Navigation - Simple */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                    isActive(link.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center">
            {/* Simple welcome message */}
            <span className="text-sm text-gray-600 mr-4">
              Hi, <span className="font-semibold text-blue-600">{userInfo?.name?.split(' ')[0] || 'there'}!</span>
            </span>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                {userInfo?.picture ? (
                  <img 
                    src={userInfo.picture} 
                    alt={userInfo.name}
                    className="h-8 w-8 rounded-full border-2 border-blue-500"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {userInfo?.name?.charAt(0) || userInfo?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{userInfo?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{userInfo?.email}</p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t shadow-lg">
            {/* User Info - Mobile */}
            <div className="px-3 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {userInfo?.picture ? (
                  <img 
                    src={userInfo.picture} 
                    alt={userInfo.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    {userInfo?.name?.charAt(0) || userInfo?.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{userInfo?.name || 'Welcome!'}</p>
                  <p className="text-xs text-gray-500 truncate">{userInfo?.email || 'Signed in'}</p>
                </div>
              </div>
            </div>

            {/* Simple Navigation Links - Mobile */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center px-3 py-3 text-base font-medium rounded-md ${
                    isActive(link.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={toggleMenu}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.name}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Profile Link - Mobile */}
            <Link
              to="/dashboard/profile"
              className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={toggleMenu}
            >
              <User className="h-5 w-5 mr-3" />
              Profile
            </Link>

            {/* Logout Button - Mobile */}
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full flex items-center px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;