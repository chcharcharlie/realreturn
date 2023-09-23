const { getData, registerHook, detachHook } = require('./firebase');

async function waitForProveSession(req, res) {
  let session_id = req.body.session_id

  if (!session_id) {
    res.status(400).send('Not valid');
    return;
  }

  const sessionResult = await getData('session_results/' + session_id)
  if (sessionResult) {
    return {
      'result': sessionResult,
    }
  }

  // If session result is pending, change request to long poll
  const session_result_callback = async function (snapshot) {
    if (snapshot.val()) {
      res.json({ result: snapshot.val() });
      detachHook("session_results/" + session_id, "value", session_result_callback)
    }
  }
  registerHook("session_results/" + session_id, "value", session_result_callback)
}

module.exports = { waitForProveSession };