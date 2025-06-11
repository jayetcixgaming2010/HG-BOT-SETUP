import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import axios from 'axios';

const Servers = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await axios.get('/api/servers', { withCredentials: true });
        setServers(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch servers');
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
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
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Servers
      </Typography>
      {servers.length === 0 ? (
        <Alert severity="info">No servers found where you have manage guild permissions.</Alert>
      ) : (
        <Grid container spacing={3}>
          {servers.map((server) => (
            <Grid item xs={12} sm={6} md={4} key={server.id}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={server.icon ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={server.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {server.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Members: {server.memberCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Features: {server.features.join(', ')}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => console.log(`Go to settings for ${server.name}`)}
                  >
                    View Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Servers; 