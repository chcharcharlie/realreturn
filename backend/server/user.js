const uuid = require('uuid4');
const Web3 = require('web3');
const web3 = new Web3();
const { setData, getData, deleteData } = require('./firebase');

/**
 * Generate and store a nonce for validating wallet ownership
 */
async function getWalletNonce(req, res) {
  const chainId = req.body.chain_id
  const walletAddress = req.body.wallet_address
  if (!chainId || !walletAddress) {
    res.status(400).send('Not valid');
    return;
  }

  const nonceData = {
    'nonce': uuid(),
    'expires_at': Date.now() + 600000 // nonce expires in 10 minutes,
  }
  await setData('wallet_nonces/' + chainId + '/' + walletAddress + '/', nonceData);
  return nonceData;
}

/**
 * Validate the signature of nonce and issue a session
 */
async function getWalletSession(req, res) {
  const chainId = req.body.chain_id
  const walletAddress = req.body.wallet_address
  const signature = req.body.signature
  if (!chainId || !walletAddress || !signature) {
    res.status(400).send('Not valid');
    return;
  }

  const nonceInfo = await getData('wallet_nonces/' + chainId + '/' + walletAddress + '/');
  if (!nonceInfo || nonceInfo.expires_at < Date.now()) {
    res.status(401).send('Not authorized');
    return;
  }

  // Treat signatures from different chains
  if (chainId == "evm") {
    // Verify the signature is with information we expected
    const expectedAddress = web3.eth.accounts.recover('Sign this message to verify ownership of ' +
      walletAddress + ', nonce: ' +
      nonceInfo.nonce, signature);
    if (!expectedAddress || expectedAddress.toLowerCase() != walletAddress.toLowerCase()) {
      res.status(401).send('Not authorized');
      return;
    }
  }

  // Delete used nonce
  deleteData('wallet_nonces/' + chainId + '/' + walletAddress + '/')

  // Issue new session for wallet
  const newSession = uuid()
  await setData('wallet_to_session/' + chainId + '/' + walletAddress + '/', {
    'session_id': newSession,
  });
  return {
    'session_id': newSession,
  }
}

module.exports = {
  getWalletNonce,
  getWalletSession,
};