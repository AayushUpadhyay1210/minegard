import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MainDashboard } from './MainDashboard';
import { SensorManagement } from './SensorManagement';
import { AlertsPanel } from './AlertsPanel';
import { Analytics } from './Analytics';
import { Settings } from './Settings';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import type { User } from '@supabase/supabase-js';

interface DashboardProps{
  user : User | null,
  supabase : any,
}

export function Dashboard({ user, supabase } : DashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchSensorData(),
      fetchAlerts()
    ]);
    setLoading(false);
  };

  const fetchSensorData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://${supabase.supabaseUrl.split('//')[1]}/functions/v1/make-server-f80a1713/sensors`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || supabase.supabaseKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSensorData(data.sensors || []);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://${supabase.supabaseUrl.split('//')[1]}/functions/v1/make-server-f80a1713/alerts`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || supabase.supabaseKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <MainDashboard sensorData={sensorData} alerts={alerts} />;
      case 'sensors':
        return <SensorManagement sensorData={sensorData} onRefresh={fetchSensorData} supabase={supabase} />;
      case 'alerts':
        return <AlertsPanel alerts={alerts} onRefresh={fetchAlerts} supabase={supabase} />;
      case 'analytics':
        return <Analytics sensorData={sensorData} supabase={supabase} />;
      case 'settings':
        return <Settings user={user} supabase={supabase} />;
      default:
        return <MainDashboard sensorData={sensorData} alerts={alerts} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-xl font-semibold">MineGuard</h1>
              <p className="text-slate-400 text-sm">Welcome back, {(user as any).user_metadata?.name || (user as any).email}</p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}