import React from 'react';
import { 
  Home, Upload, Files, History, ShieldCheck, 
  Database, Settings, LogOut, User 
} from 'lucide-react';

const NavSidebar = ({ activeNav, setActiveNav, handleLogout, username }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'access', label: 'Access Vault', icon: Files },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-gray-900/80 backdrop-blur-lg border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          BioVault Pro
        </h1>
        <div className="flex items-center mt-4">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-2 rounded-full">
            <User size={24} />
          </div>
          <div className="ml-3">
            <p className="font-medium">{username}</p>
            <p className="text-xs text-gray-400">Premium Account</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              activeNav === item.id 
                ? 'bg-gray-800/50 border-l-4 border-purple-500' 
                : 'hover:bg-gray-800/30'
            }`}
          >
            <item.icon size={20} className={activeNav === item.id ? 'text-purple-400' : 'text-gray-400'} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <LogOut size={18} className="text-gray-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default NavSidebar;