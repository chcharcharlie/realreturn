const { setData } = require('./firebase');

const JOMO_CALLBACK_API_KEY = "JomoProvesRealReturn"

async function handleJomoCallback(req, res) {
  let api_key = req.body.api_key
  let attester = req.body.attester
  let signature = req.body.signature
  let unique_id = req.body.id
  let timestamp = req.body.timestamp
  let verification_type = req.body.type
  let session_id = req.body.public_account_id
  let flow_id = req.body.flow_id
  let lower_bounds = req.body.lower_bounds
  let lower_filter = req.body.lower_filter
  let upper_bounds = req.body.upper_bounds
  let upper_filter = req.body.upper_filter

  if (!api_key || !attester || !unique_id || !timestamp || !signature || !verification_type || !session_id
    || !flow_id || !lower_bounds || !lower_filter || !upper_bounds || !upper_filter) {
    res.status(400).send('Not valid');
    return;
  }

  if (api_key !== JOMO_CALLBACK_API_KEY) {
    res.status(401).send('Not authorized');
    return;
  }

  setData("session_results/" + session_id, {
    session_id: session_id,
    attester: attester,
    unique_id: unique_id,
    timestamp: timestamp,
    signature: signature,
    result_values: lower_bounds,
  })

  return {}
}

module.exports = { handleJomoCallback };