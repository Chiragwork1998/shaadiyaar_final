import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:transform-none md:flex-shrink-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        <header className="bg-background border-b border-border sticky top-0 z-30">
          <div className="px-3 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              {/* Left Section - Menu & Logo */}
              <div className="flex items-center space-x-3 md:space-x-4">
                {/* Hamburger Menu */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 md:h-10 md:w-10"
                >
                  <Menu className="h-4 w-4 md:h-5 md:w-5" />
                </Button>

                {/* Logo and Brand */}
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="flex items-center">
                    <img 
                      src="/shaadiyaar_logo.png" 
                      alt="Shaadiyaar Logo" 
                      className="h-6 w-6 md:h-8 md:w-8" 
                    />
                    <div className="ml-2 md:ml-3">
                      <h1 className="text-sm md:text-lg font-semibold text-primary">Shaadiyaar</h1>
                      <p className="text-xs text-muted-foreground hidden sm:block">A MOMENT TO CHERISH FOR LIFE</p>
                    </div>
                  </div>
                  
                  {/* Brand Text */}
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="w-px h-6 bg-border"></div>
                    <div>
                      <h2 className="text-lg font-semibold text-primary">Shaadiyaar</h2>
                      <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Section - Search Bar */}
              <div className="flex-1 max-w-md mx-4 md:mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Right Section - Notifications & User */}
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Notification Bell */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative h-8 w-8 md:h-10 md:w-10"
                >
                  <Bell className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    3
                  </span>
                </Button>

                {/* User Avatar */}
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm md:text-base">A</span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@shaadiyaar.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;