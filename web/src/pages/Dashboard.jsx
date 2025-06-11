import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import axios from 'axios';

const StatCard = ({ title, value, icon }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {icon}
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats', { withCredentials: true });
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Servers"
            value={stats.totalServers}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Commands Today"
            value={stats.commandsToday}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Message Activity
            </Typography>
            <ResponsiveContainer>
              <LineChart
                data={stats.messageStats}
                margin={{
                  top: 16,
                  right: 16,
                  bottom: 0,
                  left: 24,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  name="Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Command Usage
            </Typography>
            <ResponsiveContainer>
              <BarChart
                data={stats.commandStats}
                margin={{
                  top: 16,
                  right: 16,
                  bottom: 0,
                  left: 24,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Commands" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
