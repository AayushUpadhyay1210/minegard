import React from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  Zap
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sensors', label: 'Sensors', icon: Activity },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeView, setActiveView }) {
  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold">MineGuard</h2>
            <p className="text-slate-400 text-sm">Monitoring Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-left",
                  isActive 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
                onClick={() => setActiveView(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Status Indicator */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-slate-400">System Online</span>
        </div>
      </div>
    </div>
  );
}