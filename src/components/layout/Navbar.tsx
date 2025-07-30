import React from 'react';
import { Heart, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-rose-600" />
            <span className="ml-2 text-xl font-serif text-gray-900">Wedify</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-900 hover:text-rose-600">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-rose-600">Leads</a>
            <a href="#" className="text-gray-600 hover:text-rose-600">Calendar</a>
            <a href="#" className="text-gray-600 hover:text-rose-600">Settings</a>
          </div>

          <div className="flex items-center">
            <button className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">
              Add Lead
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;