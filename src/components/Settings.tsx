import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  Bell, 
  Shield, 
  Settings as SettingsIcon,
  Save,
  Database,
  Wifi,
  AlertTriangle
} from 'lucide-react';

export function Settings({ user, supabase } : any) {
  const [profile, setProfile] = useState({
    name: user.user_metadata?.name || '',
    email: user.email || '',
    role: 'Operator'
  });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    warningAlerts: true,
    systemUpdates: false,
    maintenanceReminders: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const [systemSettings, setSystemSettings] = useState({
    dataRetention: '90',
    refreshInterval: '5',
    alertThresholds: {
      temperature: { min: 0, max: 50 },
      pressure: { min: 90, max: 110 },
      gasLevel: { min: 0, max: 0.1 }
    },
    autoBackup: true,
    maintenanceMode: false
  });

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: profile.name }
      });

      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Profile update error:', error);
    }
  };

  const handleSaveNotifications = () => {
    // In a real app, this would save to user preferences
    toast.success('Notification preferences saved');
  };

  const handleSaveSystem = () => {
    // In a real app, this would save to system configuration
    toast.success('System settings saved');
  };

  const handleTestConnection = () => {
    // Simulate connection test
    setTimeout(() => {
      toast.success('Database connection successful');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Settings</h2>
        <p className="text-slate-400">Manage your account and system preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="profile" className="text-white data-[state=active]:bg-blue-600">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-blue-600">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="text-white data-[state=active]:bg-blue-600">
            <SettingsIcon className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-600">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-slate-700 border-slate-600 text-white opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-white">Role</Label>
                  <Input
                    id="role"
                    value={profile.role}
                    disabled
                    className="bg-slate-700 border-slate-600 text-white opacity-50"
                  />
                </div>
              </div>
              
              <Separator className="bg-slate-600" />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-white font-medium">Alert Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Critical Alerts</p>
                      <p className="text-slate-400 text-sm">Immediate notifications for critical system issues</p>
                    </div>
                    <Switch
                      checked={notifications.criticalAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, criticalAlerts: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Warning Alerts</p>
                      <p className="text-slate-400 text-sm">Notifications for warning conditions</p>
                    </div>
                    <Switch
                      checked={notifications.warningAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, warningAlerts: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">System Updates</p>
                      <p className="text-slate-400 text-sm">Software updates and maintenance notifications</p>
                    </div>
                    <Switch
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Maintenance Reminders</p>
                      <p className="text-slate-400 text-sm">Scheduled maintenance notifications</p>
                    </div>
                    <Switch
                      checked={notifications.maintenanceReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, maintenanceReminders: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-600" />

              <div className="space-y-4">
                <h3 className="text-white font-medium">Delivery Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-slate-400 text-sm">Send notifications to your email address</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">SMS Notifications</p>
                      <p className="text-slate-400 text-sm">Send critical alerts via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-600" />

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention" className="text-white">Data Retention (days)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={systemSettings.dataRetention}
                      onChange={(e) => setSystemSettings({...systemSettings, dataRetention: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval" className="text-white">Refresh Interval (seconds)</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      value={systemSettings.refreshInterval}
                      onChange={(e) => setSystemSettings({...systemSettings, refreshInterval: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Automatic Backup</p>
                    <p className="text-slate-400 text-sm">Daily backup of sensor data and configurations</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Alert Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Temperature (°C)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={systemSettings.alertThresholds.temperature.min}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          alertThresholds: {
                            ...systemSettings.alertThresholds,
                            temperature: { ...systemSettings.alertThresholds.temperature, min: parseFloat(e.target.value) }
                          }
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={systemSettings.alertThresholds.temperature.max}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          alertThresholds: {
                            ...systemSettings.alertThresholds,
                            temperature: { ...systemSettings.alertThresholds.temperature, max: parseFloat(e.target.value) }
                          }
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-500" />
                    <span className="text-white">Database Connection</span>
                  </div>
                  <Button onClick={handleTestConnection} variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white">
                    Test Connection
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-green-500" />
                    <span className="text-white">Network Status</span>
                  </div>
                  <span className="text-green-500 text-sm">Connected</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Maintenance Mode</p>
                    <p className="text-slate-400 text-sm">Disable data collection for system maintenance</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSystem} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Security & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-medium">Security Notice</p>
                      <p className="text-yellow-300 text-sm">
                        This is a demo environment. In production, implement proper security measures including:
                      </p>
                      <ul className="text-yellow-300 text-sm mt-2 space-y-1">
                        <li>• Multi-factor authentication</li>
                        <li>• Role-based access control</li>
                        <li>• Audit logging</li>
                        <li>• Data encryption</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white font-medium">Session Management</h3>
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white text-sm">Current Session</p>
                        <p className="text-slate-400 text-xs">Started: {new Date().toLocaleString()}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => supabase.auth.signOut()}
                        className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                      >
                        End Session
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}