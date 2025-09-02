const express = require('express');
const bodyParser = require('body-parser');
const next = require('next');
const https = require('https');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');

// Import your Node API router from ./backend/index.js
const backendApi = require('./backend/index');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: false });
const nextHandler = nextApp.getRequestHandler();

const whitelist = ['https://gtrac.in:8080', 'https://www.gtrac.in:8080', 'http://localhost:3333'];
const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (e.g., same-origin or non-browser clients)
		if (!origin || whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS ' + origin));
		}
	},
};
nextApp.prepare().then(() => {
	const app = express();

	// Enable CORS and JSON body parsing
	app.use(cors(corsOptions));
	app.use(bodyParser.json());

	// Set up session middleware for OIDC authentication
	app.use(
		session({
			secret: process.env.SESSION_SECRET || 'supersecretkey',
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: process.env.NODE_ENV === 'production',
				maxAge: 24 * 60 * 60 * 1000, // 24 hours
				httpOnly: true,
				sameSite: 'lax',
			},
		})
	);

	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Request-With');
		next();
	});

	// Example Express API route
	app.get(
		'/api/example',
		(req, res, next) => {
			console.log('the response will be sent by the next function ...');
			next();
		},
		(req, res) => {
			res.send('Hello from B!');
		}
	);

	// Mount your Node API from ./backend/index.js under /api/node
	app.use('/api/node', backendApi);

	// Let Next.js handle all other routes
	app.all('*', (req, res) => {
		return nextHandler(req, res);
	});

	// Create an HTTPS server
	// const sslServer = https.createServer(
	// 	{
	// 		key: fs.readFileSync(path.join(__dirname, 'certification', 'private-key.key')),
	// 		cert: fs.readFileSync(path.join(__dirname, 'certification', 'gd_bundle-g2-g1new.crt')),
	// 	},
	// 	app
	// );

	app.listen(3333, () => {
		console.log('Server started on port 3333');
	});
});
