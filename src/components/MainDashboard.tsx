import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {  
  Gauge, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield
} from 'lucide-react';

// Define interfaces for type safety
interface Sensor {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'warning' | 'critical' | 'offline';
  location: string;
  value: number;
  unit: string;
  type: string;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  message: string;
  sensor: string;
}

interface MainDashboardProps {
  sensorData: Sensor[];
  alerts: Alert[];
}

export function MainDashboard({ sensorData, alerts }: MainDashboardProps) {
  const activeSensors = sensorData.filter((s: Sensor) => s.status === 'active').length;
  const criticalAlerts = alerts.filter((a: Alert) => a.severity === 'critical').length;
  const warningAlerts = alerts.filter((a: Alert) => a.severity === 'warning').length;

  const overviewStats = [
    {
      title: 'Active Sensors',
      value: activeSensors,
      total: sensorData.length,
      icon: Activity,
      color: 'text-green-500'
    },
    {
      title: 'Critical Alerts',
      value: criticalAlerts,
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      title: 'Warning Alerts',
      value: warningAlerts,
      icon: Shield,
      color: 'text-yellow-500'
    },
    {
      title: 'System Health',
      value: '98.5%',
      icon: TrendingUp,
      color: 'text-blue-500'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info' | string): "destructive" | "secondary" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.title}</p>
                    <p className="text-white text-2xl font-bold">
                      {stat.value}
                      {stat.total && <span className="text-slate-400 text-base">/{stat.total}</span>}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Sensor Readings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Sensor Readings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sensorData.slice(0, 6).map((sensor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(sensor.status)}`}></div>
                    <div>
                      <p className="text-white font-medium">{sensor.name}</p>
                      <p className="text-slate-400 text-sm">{sensor.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{sensor.value} {sensor.unit}</p>
                    <p className="text-slate-400 text-sm">{sensor.type}</p>
                  </div>
                </div>
              ))}
              {sensorData.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No sensor data available</p>
                  <p className="text-slate-500 text-sm">Sensors will appear here once connected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.slice(0, 6).map((alert, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                        {alert.severity}
                      </Badge>
                      <span className="text-slate-400 text-xs">{alert.timestamp}</span>
                    </div>
                    <p className="text-white text-sm">{alert.message}</p>
                    <p className="text-slate-400 text-xs">{alert.sensor}</p>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No recent alerts</p>
                  <p className="text-slate-500 text-sm">System is operating normally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">CPU Usage</span>
                <span className="text-white">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-white">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Network Load</span>
                <span className="text-white">23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}