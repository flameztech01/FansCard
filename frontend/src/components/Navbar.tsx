import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogIn, UserPlus, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoggedIn] = useState(false); // This would come from your auth context

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Packages', href: '#packages' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Support', href: '#support' },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(targetId);
      
      if (isOpen) {
        setIsOpen(false);
      }
    }
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.replace('#', ''));
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const offset = 100;
          
          if (rect.top <= offset && rect.bottom >= offset) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - stays on page with smooth scroll */}
          <a 
            href="#home" 
            onClick={(e) => scrollToSection(e, '#home')}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors cursor-pointer"
          >
            FanCardStore
          </a>

          {/* Desktop Navigation Links - stay on page with smooth scroll */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer
                  ${activeSection === link.href.replace('#', '')
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons - now using Link for navigation to different pages */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              // Logged in state
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <a
                  href="#packages"
                  onClick={(e) => scrollToSection(e, '#packages')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Buy Package
                </a>
              </>
            ) : (
              // Logged out state - Login and Signup go to different pages
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t shadow-lg">
            {/* Navigation Links - stay on page */}
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors cursor-pointer
                  ${activeSection === link.href.replace('#', '')
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
              >
                {link.name}
              </a>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Mobile Auth Buttons - Login/Signup use Link, Buy Package stays on page */}
            {isLoggedIn ? (
              // Logged in state
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3" />
                    Dashboard
                  </div>
                </Link>
                <a
                  href="#packages"
                  onClick={(e) => {
                    scrollToSection(e, '#packages');
                    setIsOpen(false);
                  }}
                  className="block px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700"
                >
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-3" />
                    Buy Package
                  </div>
                </a>
              </>
            ) : (
              // Logged out state - Login and Signup use Link
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <LogIn className="h-5 w-5 mr-3" />
                    Login
                  </div>
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-3" />
                    Sign Up
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;