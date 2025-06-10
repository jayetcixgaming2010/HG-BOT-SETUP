const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const sequelize = require('./config/database');
const { Op } = require('sequelize');
const GuildSettings = require('./models/GuildSettings');
const CommandStats = require('./models/CommandStats');
const MessageStats = require('./models/MessageStats');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const RedisStore = require('connect-redis').default;
const Redis = require('redis');
const logger = require('./config/logger');
require('dotenv').config();

// Initialize Redis client
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
  ],
});

// Collections
client.commands = new Collection();
client.spamCache = new Map();
client.cooldowns = new Map();
const commands = [];

// Authenticate and sync Sequelize models
sequelize.authenticate()
  .then(() => {
    logger.info('Database connection has been established successfully.');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    logger.info('All models were synchronized successfully.');
  })
  .catch(err => {
    logger.error('Unable to connect to the database or sync models:', err);
  });

// Load commands with error handling
const loadCommands = () => {
  try {
    const commandFolders = fs.readdirSync('./commands');
    for (const folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      }
    }
    logger.info(`Loaded ${commands.length} commands`);
  } catch (error) {
    logger.error('Error loading commands:', error);
  }
};

// Load events with error handling
const loadEvents = () => {
  try {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`./events/${file}`);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
    logger.info(`Loaded ${eventFiles.length} events`);
  } catch (error) {
    logger.error('Error loading events:', error);
  }
};

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Session configuration with Redis store
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/api/auth/discord/callback`,
  scope: ['identify', 'guilds'],
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    return done(null, profile);
  });
}));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Load commands and events
loadCommands();
loadEvents();

// Register slash commands
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    logger.info('Successfully registered application commands');
  } catch (error) {
    logger.error('Error registering commands:', error);
  }
})();

// Auth routes
app.get('/api/auth/discord', passport.authenticate('discord'));

app.get('/api/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

app.get('/api/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

// API endpoints with improved error handling
app.get('/api/stats', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const totalCommandsToday = await CommandStats.count({
      where: {
        timestamp: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    const messageStats = await MessageStats.findAll({
      where: {
        date: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      order: [['date', 'ASC']],
      attributes: ['date', 'count']
    });

    const commandStats = await CommandStats.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    const stats = {
      totalServers: client.guilds.cache.size,
      totalMembers: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      commandsToday: totalCommandsToday,
      messageStats: messageStats.map(s => s.toJSON()),
      commandStats: commandStats.map(s => s.toJSON())
    };
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/servers', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const userGuilds = req.user.guilds.filter(g => (g.permissions & 0x20) === 0x20);
    const botGuilds = client.guilds.cache;

    const servers = userGuilds.map(guild => {
      const botGuild = botGuilds.get(guild.id);
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        memberCount: botGuild?.memberCount || 0,
        features: botGuild ? ['Moderation', 'Welcome', 'Music'] : [],
      };
    });

    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

app.get('/api/servers/:id', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const guild = client.guilds.cache.get(req.params.id);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    const settings = await GuildSettings.findOne({ where: { guildId: guild.id } });
    res.json({
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        memberCount: guild.memberCount,
      },
      settings: settings ? settings.toJSON() : {},
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server settings' });
  }
});

app.post('/api/servers/:id/settings', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { settings } = req.body;
    await GuildSettings.upsert({ guildId: req.params.id, ...settings });
    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update server settings' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'web', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Login bot with error handling
client.login(process.env.TOKEN).catch(error => {
  logger.error('Error logging in to Discord:', error);
  process.exit(1);
});