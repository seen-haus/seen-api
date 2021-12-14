# SEEN API V2

### Tech stack
- NodeJS
- MySQL

### Requirements
- NodeJS v12
- MySQL 8
- Pusher 

### Setup
```
# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed data 
npm run seed 

# Copy the example environment file and configure to your needs
cp .env.example .env
```

### Running the app
```
# Run express server (run the server)
npm run watch

# Run web3 worker (listen for on-chain events)
npm run listen

# Run fallback worker (fill missing events, close finished auctions, mark collectables as sold out)
npm run fallback

# Set user's password (don't do this unless you want to grant admin dashboard access)
npm run user -- --id={id} --password="password"
```

### Running the app in production
```
pm2 startOrRestart ./config/ecosystem.json

Setup a cronjob to run "npm run fallback" every 10 min.
```

### ENV Variable Management

Update .env manually in `/var/www/api.seen.haus/webdir/source`