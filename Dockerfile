# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install build tools for native modules (like sqlite3)
RUN apk add --no-cache build-base python3

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build web dashboard
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"] 
