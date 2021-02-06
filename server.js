const path = require('path');
const express = require('express');

const app = express();
const DIST_DIR = path.join(__dirname, '/dist');
const ASSETS_DIR = path.join(__dirname, '/src/assets');
const WEBPACK_DIR = path.join(__dirname, '/webpack');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

app.use(express.static(DIST_DIR));

app.use('/assets', express.static(ASSETS_DIR));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
	console.log('Listening on PORT', PORT);
});