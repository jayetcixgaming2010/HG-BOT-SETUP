import React from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import { Discord as DiscordIcon } from '../components/DiscordIcon'; // We'll create this custom icon
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // If already authenticated, redirect to dashboard
    window.location.href = '/';
    return null; // Or a loading spinner
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Welcome to Bot Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DiscordIcon sx={{ fontSize: 24 }} />}
          onClick={login}
          sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
        >
          Login with Discord
        </Button>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          You need to be logged in to manage your Discord bot.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login; 