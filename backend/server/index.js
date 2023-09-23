// server/index.js

const PORT = process.env.SERVER_PORT;
const express = require('express');
const app = express();
app.use(express.json({ limit: '1mb' }));
const functions = require('firebase-functions');
const cors = require('cors');
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

const { getWalletNonce, getWalletSession } = require('./user');
const { getLeaderboardData, shareToLeaderboard } = require('./leaderboard');
const { handleJomoCallback } = require('./jomo_callback');
const { waitForProveSession } = require('./prove');

app.post('/api/fake', (req, res) => {
  console.log(req.body);
  res.json({ message: 'Call received!' });
});

app.post('/api/get_leaderboard_data', (req, res) => {
  getLeaderboardData(req, res).then((response) => {
    if (response) {
      res.json(response);
    }
  });
});

app.post('/api/get_wallet_nonce', (req, res) => {
  getWalletNonce(req, res).then((response) => {
    if (response) {
      res.json(response);
    }
  });
});

app.post('/api/get_wallet_session', (req, res) => {
  getWalletSession(req, res).then((response) => {
    if (response) {
      res.json(response);
    }
  });
});

app.post('/api/jomo_callback', (req, res) => {
  handleJomoCallback(req, res).then((response) => {
    if (response) {
      res.json(response);
    }
  });
});

app.post('/api/get_session_result', (req, res) => {
  waitForProveSession(req, res).then((response) => {
    if (response) {
      res.json(response);
    }
  });
});

app.post('/api/share_to_leaderboard', (req, res) => {
  shareToLeaderboard(req, res).then((response) => {
    if (response) {
      res.json(response);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Expose Express API as a single Cloud Function:
exports.backend_apis = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 540,
    memory: '2GB',
    maxInstances: 5,
    ingressSettings: "ALLOW_ALL",
  })
  .https.onRequest(app);
