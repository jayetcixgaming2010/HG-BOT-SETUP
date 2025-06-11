const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.get('/auth/discord', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.OAUTH2_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.OAUTH2_REDIRECT_URI)}&response_type=code&scope=identify guilds`;
  res.redirect(url);
});

router.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.OAUTH2_CLIENT_ID,
      client_secret: process.env.OAUTH2_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.OAUTH2_REDIRECT_URI,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const accessToken = tokenResponse.data.access_token;
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Filter guilds where user has MANAGE_GUILD permission (1 << 5)
    const manageableGuilds = guildsResponse.data.filter(guild => (guild.permissions & 0x20) === 0x20);

    if (manageableGuilds.length === 0) {
      return res.status(403).send('You do not have permission to manage any servers.');
    }

    // For simplicity, redirect to dashboard with first manageable guild
    // In production, render a server selection page
    const guild = manageableGuilds[0];
    res.redirect(`/dashboard?guildId=${guild.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;