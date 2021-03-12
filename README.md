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
```


### Running the app
```
# Run express server (run the server)
npm run watch

# Run web3 worker (listen for on-chain events)
npm run listen

# Run fallback worker (fill missing events, close finished auctions, mark collectables as sold out)
npm run fallback
```

### Running the app in production
```
pm2 startOrRestart ./config/ecosystem.json

Setup a cronjob to run "npm run fallback" every 10 min.
```
