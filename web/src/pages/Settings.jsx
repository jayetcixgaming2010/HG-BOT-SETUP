import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import axios from 'axios';

const Settings = () => {
  const [guildId, setGuildId] = useState(''); // This should ideally come from route params or user selection
  const [settings, setSettings] = useState({
    prefix: '!',
    welcomeChannelId: '',
    // Add more settings here as per your GuildSettings model
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // In a real application, you would get the guildId from a selected server
    // For now, let's assume a default or prompt the user.
    // Or perhaps this page is for general bot settings, not guild-specific.
    // For this example, we'll load settings if a guildId is present.
    if (guildId) {
      const fetchSettings = async () => {
        try {
          const response = await axios.get(`/api/servers/${guildId}`, { withCredentials: true });
          setSettings(response.data.settings);
          setError(null);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch settings');
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    } else {
      setLoading(false);
      // If no guildId, this could be a page for global bot settings or show a selection.
      // For now, it will just show default settings.
    }
  }, [guildId]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!guildId) {
      setError('Please select a server to update settings.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`/api/servers/${guildId}/settings`, { settings }, { withCredentials: true });
      setSuccess(response.data.message || 'Settings updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Typography variant="h6" gutterBottom>Guild Settings</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Bot Prefix"
            name="prefix"
            value={settings.prefix}
            onChange={handleChange}
            margin="normal"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Welcome Channel ID"
            name="welcomeChannelId"
            value={settings.welcomeChannelId}
            onChange={handleChange}
            margin="normal"
            sx={{ mb: 2 }}
          />
          {/* Add more settings fields based on GuildSettings model */}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            sx={{ mt: 2 }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </form>
      </Paper>
      
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>General Bot Settings</Typography>
        <FormControlLabel
          control={<Switch checked={true} name="exampleGlobalSetting" />}
          label="Enable Fun Commands (Example)"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          (These settings would apply globally to the bot, not per guild. Requires separate backend logic.)
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings; 