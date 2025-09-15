import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Bell, Shield } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  created_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  timestamp: string;
  sensor: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onRefresh: () => void;
  supabase: any; // Or use proper SupabaseClient type
}

export function AlertsPanel({ alerts, onRefresh, supabase }: AlertsPanelProps) {
  const [loading, setLoading] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Bell className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://${supabase.supabaseUrl.split('//')[1]}/functions/v1/make-server-f80a1713/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        toast.success('Alert acknowledged');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to acknowledge alert');
      }
    } catch (error) {
      toast.error('Network error while acknowledging alert');
      console.error('Acknowledge alert error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged);
  const warningAlerts = alerts.filter(a => a.severity === 'warning' && !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Alert Management</h2>
          <p className="text-slate-400">Monitor and respond to system alerts</p>
        </div>
        <Button onClick={onRefresh} variant="outline" className="bg-slate-700 border-slate-600 text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">Critical Alerts</p>
                <p className="text-white text-2xl font-bold">{criticalAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-900/20 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm">Warning Alerts</p>
                <p className="text-white text-2xl font-bold">{warningAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-900/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">Acknowledged</p>
                <p className="text-white text-2xl font-bold">{acknowledgedAlerts.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active Alerts ({criticalAlerts.length + warningAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...criticalAlerts, ...warningAlerts].map((alert) => (
                <div key={alert.id} className="p-4 bg-slate-700 rounded-lg border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-slate-400 text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(alert.timestamp)}
                          </span>
                        </div>
                        <p className="text-white font-medium mb-1">{alert.message}</p>
                        <p className="text-slate-400 text-sm">Source: {alert.sensor}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      disabled={loading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acknowledged Alerts */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Acknowledged Alerts ({acknowledgedAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {acknowledgedAlerts.length > 0 ? (
            <div className="space-y-3">
              {acknowledgedAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                        <span className="text-slate-500 text-sm">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm">{alert.message}</p>
                      <p className="text-slate-500 text-xs">Source: {alert.sensor}</p>
                      {alert.acknowledged_at && (
                        <p className="text-slate-500 text-xs mt-1">
                          Acknowledged: {formatTimestamp(alert.acknowledged_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No acknowledged alerts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* No Alerts State */}
      {alerts.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No Alerts</h3>
            <p className="text-slate-400">All systems are operating normally. Alerts will appear here when issues are detected.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}