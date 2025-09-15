import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Download } from 'lucide-react';
import { Button } from './ui/button';

export function Analytics({ sensorData, supabase }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({
    trends: [],
    distribution: [],
    summary: {}
  });

  useEffect(() => {
    generateAnalyticsData();
  }, [sensorData, timeRange, selectedSensor]);

  const generateAnalyticsData = () => {
    // Generate mock historical data for demonstration
    const now = new Date();
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    
    const trends = Array.from({ length: hours }, (_, i) => {
      const time = new Date(now.getTime() - (hours - i) * 60 * 60 * 1000);
      const data = {
        time: time.toISOString(),
        timestamp: timeRange === '24h' ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : time.toLocaleDateString()
      };

      sensorData.forEach(sensor => {
        if (selectedSensor === 'all' || selectedSensor === sensor.id) {
          // Generate realistic trend data with some variation
          const baseValue = sensor.value;
          const variation = baseValue * 0.1 * (Math.random() - 0.5);
          data[sensor.name] = parseFloat((baseValue + variation).toFixed(2));
        }
      });

      return data;
    });

    // Generate distribution data
    const sensorTypes = [...new Set(sensorData.map(s => s.type))];
    const distribution = sensorTypes.map(type => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: sensorData.filter(s => s.type === type).length,
      percentage: Math.round((sensorData.filter(s => s.type === type).length / sensorData.length) * 100)
    }));

    // Generate summary statistics
    const activeSensors = sensorData.filter(s => s.status === 'active').length;
    const avgReadings = sensorData.reduce((acc, sensor) => {
      if (!acc[sensor.type]) acc[sensor.type] = [];
      acc[sensor.type].push(sensor.value);
      return acc;
    }, {});

    const summary = {
      totalSensors: sensorData.length,
      activeSensors,
      averageReadings: Object.entries(avgReadings).map(([type, values]) => ({
        type: type.replace('_', ' ').toUpperCase(),
        average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
        unit: sensorData.find(s => s.type === type)?.unit || ''
      }))
    };

    setAnalyticsData({ trends, distribution, summary });
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];

  const filteredSensors = selectedSensor === 'all' 
    ? sensorData 
    : sensorData.filter(s => s.id === selectedSensor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-slate-400">Historical data analysis and trends</p>
        </div>
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Time Range:</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Sensor:</label>
          <Select value={selectedSensor} onValueChange={setSelectedSensor}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Sensors</SelectItem>
              {sensorData.map(sensor => (
                <SelectItem key={sensor.id} value={sensor.id}>{sensor.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Sensors</p>
                <p className="text-white text-2xl font-bold">{analyticsData.summary.totalSensors}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Sensors</p>
                <p className="text-white text-2xl font-bold">{analyticsData.summary.activeSensors}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Uptime</p>
                <p className="text-white text-2xl font-bold">99.2%</p>
              </div>
              <PieChartIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Data Points</p>
                <p className="text-white text-2xl font-bold">12.5K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Sensor Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  {filteredSensors.map((sensor, index) => (
                    <Line 
                      key={sensor.id}
                      type="monotone" 
                      dataKey={sensor.name} 
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Sensor Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percentage}) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Readings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Average Readings by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.summary.averageReadings?.map((reading, index) => (
              <div key={index} className="p-4 bg-slate-700 rounded-lg">
                <h4 className="text-white font-medium">{reading.type}</h4>
                <p className="text-2xl font-bold text-blue-400">
                  {reading.average} {reading.unit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}