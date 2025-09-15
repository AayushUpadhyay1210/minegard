import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Plus, Settings, Trash2, RefreshCw } from 'lucide-react';

export function SensorManagement({ sensorData, onRefresh, supabase } : any) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSensor, setNewSensor] = useState({
    name: '',
    type: '',
    location: '',
    unit: '',
    value: 0
  });

  const sensorTypes = [
    { value: 'temperature', label: 'Temperature' },
    { value: 'pressure', label: 'Pressure' },
    { value: 'gas', label: 'Gas Detection' },
    { value: 'vibration', label: 'Vibration' },
    { value: 'air_quality', label: 'Air Quality' },
    { value: 'water_level', label: 'Water Level' },
    { value: 'humidity', label: 'Humidity' },
    { value: 'noise', label: 'Noise Level' }
  ];

  const getStatusColor = (status : any) => {
    switch (status) {
      case 'active': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  const handleAddSensor = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://${supabase.supabaseUrl.split('//')[1]}/functions/v1/make-server-f80a1713/sensors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(newSensor)
      });

      if (response.ok) {
        toast.success('Sensor added successfully');
        setIsAddingNew(false);
        setNewSensor({ name: '', type: '', location: '', unit: '', value: 0 });
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add sensor');
      }
    } catch (error) {
      toast.error('Network error while adding sensor');
      console.error('Add sensor error:', error);
    }
  };

  const handleUpdateSensorStatus = async (sensorId : any, status : any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://${supabase.supabaseUrl.split('//')[1]}/functions/v1/make-server-f80a1713/sensors/${sensorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Sensor status updated');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update sensor');
      }
    } catch (error) {
      toast.error('Network error while updating sensor');
      console.error('Update sensor error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Sensor Management</h2>
          <p className="text-slate-400">Monitor and configure mining sensors</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onRefresh} variant="outline" className="bg-slate-700 border-slate-600 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Sensor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Sensor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Sensor Name</Label>
                  <Input
                    id="name"
                    value={newSensor.name}
                    onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
                    placeholder="e.g., Temperature Sensor A1"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-white">Sensor Type</Label>
                  <Select value={newSensor.type} onValueChange={(value) => setNewSensor({...newSensor, type: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select sensor type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {sensorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={newSensor.location}
                    onChange={(e) => setNewSensor({...newSensor, location: e.target.value})}
                    placeholder="e.g., Tunnel A - Section 1"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-white">Unit</Label>
                  <Input
                    id="unit"
                    value={newSensor.unit}
                    onChange={(e) => setNewSensor({...newSensor, unit: e.target.value})}
                    placeholder="e.g., °C, ppm, kPa"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleAddSensor}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!newSensor.name || !newSensor.type || !newSensor.location}
                  >
                    Add Sensor
                  </Button>
                  <Button 
                    onClick={() => setIsAddingNew(false)}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sensorData.map((sensor : any) => (
          <Card key={sensor.id} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{sensor.name}</CardTitle>
                <Badge variant={getStatusColor(sensor.status)}>
                  {sensor.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white capitalize">{sensor.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white text-sm">{sensor.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Value:</span>
                  <span className="text-white font-bold">{sensor.value} {sensor.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Update:</span>
                  <span className="text-white text-sm">
                    {new Date(sensor.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex gap-2 pt-3">
                  <Select 
                    value={sensor.status} 
                    onValueChange={(status) => handleUpdateSensorStatus(sensor.id, status)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sensorData.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Settings className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No Sensors Configured</h3>
            <p className="text-slate-400 mb-6">Start by adding your first mining sensor to begin monitoring.</p>
            <Button 
              onClick={() => setIsAddingNew(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Sensor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}