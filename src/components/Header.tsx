import { Button } from "@/components/ui/button";
import { Brain, Menu, X, Info, BookOpen, LayoutDashboard, MessageSquare, Trophy, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'SYLLABUS', icon: BookOpen, path: '/syllabus' },
    { name: 'ASK AI', icon: MessageSquare, path: '/ask-ai' },
    { name: 'DASHBOARD', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'QUIZ', icon: Trophy, path: '/quiz' },
    { name: 'ABOUT US', icon: Info, path: '/about' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-gray-800/50 z-50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between relative">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 sm:p-2 rounded-lg">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-white">LastMin AI</h1>
              <p className="text-xs text-gray-400 hidden xs:block sm:block">Smart Study Companion</p>
            </div>
          </div>

          {/* Desktop Navigation - Centered */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          {/* Tablet Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex lg:hidden items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                      title={item.name}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-2 border-purple-600/60">
                  <User className="h-4 w-4 text-white" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 backdrop-blur-sm flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xl:inline">LOG OUT</span>
                </Button>
              </div>
            ) : (
              <>
                <Button variant="hero" size="sm" onClick={handleGetStarted} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Get Started
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignIn} className="border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm px-6 py-2 rounded-lg text-sm font-medium">
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Tablet CTA Buttons */}
          <div className="hidden md:flex lg:hidden items-center gap-3">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 backdrop-blur-sm flex items-center justify-center p-2.5 rounded-lg transition-all duration-200"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="hero" 
                  size="sm" 
                  onClick={handleGetStarted} 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignIn} 
                  className="border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Mobile CTA Buttons - Show buttons instead of menu for non-authenticated users */}
          {!isAuthenticated ? (
            <div className="flex md:hidden items-center gap-2">
              <Button 
                variant="hero" 
                size="sm" 
                onClick={handleGetStarted} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-medium min-h-[36px] xs:min-h-[40px]"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignIn} 
                className="border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-medium min-h-[36px] xs:min-h-[40px]"
              >
                Sign In
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Logout Button for authenticated users */}
              <div className="hidden sm:flex md:hidden items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 backdrop-blur-sm flex items-center justify-center p-2 rounded-lg transition-all duration-200"
                  title="Log Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Mobile Menu Button - only for authenticated users */}
              <button
                className="md:hidden p-1.5 sm:p-2 text-gray-200 hover:text-white transition-colors duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden mt-3 sm:mt-4 py-3 sm:py-4 border-t border-gray-800/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <nav className="flex flex-col gap-2 sm:gap-3">
              {isAuthenticated ? (
                <>
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.button
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 min-h-[44px] touch-manipulation ${
                          isActive 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        {item.name}
                      </motion.button>
                    );
                  })}
                  <div className="border-t border-gray-800/50 pt-3 sm:pt-4 mt-3 sm:mt-4">
                    <div className="flex items-center gap-3 px-3 sm:px-4 mb-2 sm:mb-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-2 border-purple-600/60">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-300 text-sm font-medium">{user?.name || 'User'}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 backdrop-blur-sm flex items-center gap-2 justify-center py-2.5 sm:py-3 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      LOG OUT
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3">
                  <Button 
                    variant="hero" 
                    size="sm" 
                    onClick={() => {
                      handleGetStarted();
                      setIsMenuOpen(false);
                    }} 
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 sm:py-3 rounded-lg font-medium"
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleSignIn();
                      setIsMenuOpen(false);
                    }} 
                    className="border-2 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm py-2.5 sm:py-3 rounded-lg font-medium"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;