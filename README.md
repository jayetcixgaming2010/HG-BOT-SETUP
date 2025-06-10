# Discord Bot with Web Dashboard

A Discord bot with a web dashboard for management and monitoring.

## Features

- Discord bot with slash commands
- Web dashboard for bot management
- Real-time statistics
- Server management
- User authentication via Discord
- MongoDB database integration
- Redis caching
- Docker support

## Prerequisites

- Node.js 18 or higher
- MongoDB
- Redis
- Discord Bot Token
- Heroku account (for deployment)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Discord Bot Configuration
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
CLIENT_SECRET=your_discord_client_secret

# MongoDB Configuration
MONGO_URI=your_mongodb_uri

# Redis Configuration
REDIS_URL=your_redis_url

# Web Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:3000

# Security
SESSION_SECRET=your_session_secret
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build web dashboard:
```bash
npm run build
```

## Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

## GitHub Deployment

1. Fork this repository
2. Add the following secrets to your GitHub repository:
   - `HEROKU_API_KEY`: Your Heroku API key
   - `HEROKU_APP_NAME`: Your Heroku app name
   - `HEROKU_EMAIL`: Your Heroku email

3. Push to main branch to trigger deployment

## Heroku Deployment

1. Create a new Heroku app
2. Add MongoDB and Redis add-ons
3. Set environment variables in Heroku dashboard
4. Deploy using GitHub integration or Heroku CLI

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 