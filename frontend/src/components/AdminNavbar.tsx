import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  Link as LinkIcon,
  Home as HomeIcon,
  Link2Icon,
} from 'lucide-react';
import { adminLogout } from '../slices/authSlice';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get admin info from Redux store
  const adminInfo = useSelector((state: any) => state.auth.adminInfo);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // ✅ CHANGED: nav links are now Home + Generate Link
  const navLinks = [
    { name: 'Home', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Generate Link', href: '/admin/generate-link', icon: LinkIcon },
    {name: 'Generated Links', href: '/admin/generated-links', icon: Link2Icon}
  ];

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/admin/dashboard"
            className="text-2xl font-bold flex items-center space-x-2"
          >
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Admin Panel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Admin Menu - Desktop */}
          <div className="hidden md:flex items-center">
            {/* Admin Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 focus:outline-none bg-gray-800 hover:bg-gray-700 rounded-lg pl-3 pr-2 py-2 transition-colors"
              >
                {/* Admin Avatar */}
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {adminInfo?.name ? getInitials(adminInfo.name) : 'A'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {adminInfo?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {adminInfo?.role || 'Administrator'}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-700">
                    {/* Admin Info */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-semibold text-white">
                        {adminInfo?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {adminInfo?.email}
                      </p>
                      <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-900/50 rounded-full">
                        <Shield className="h-3 w-3 text-blue-400 mr-1" />
                        <span className="text-xs text-blue-300 capitalize">
                          {adminInfo?.role || 'Admin'}
                        </span>
                      </div>
                    </div>

                    {/* Profile Link */}
                    <Link
                      to="/admin/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile Settings
                    </Link>

                    {/* Settings Link */}
                    <Link
                      to="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      System Settings
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900 border-t border-gray-800">
            {/* Admin Info - Mobile */}
            <div className="px-3 py-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {adminInfo?.name ? getInitials(adminInfo.name) : 'A'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {adminInfo?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {adminInfo?.email || 'admin@example.com'}
                  </p>
                  <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-blue-900/50 rounded-full">
                    <Shield className="h-3 w-3 text-blue-400 mr-1" />
                    <span className="text-xs text-blue-300 capitalize">
                      {adminInfo?.role || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links - Mobile */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                  onClick={toggleMenu}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-800 my-2"></div>

            {/* Profile Link - Mobile */}
            <Link
              to="/admin/profile"
              className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
              onClick={toggleMenu}
            >
              <User className="h-5 w-5" />
              <span>Profile Settings</span>
            </Link>

            {/* Logout Button - Mobile */}
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full flex items-center space-x-3 px-3 py-3 text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;