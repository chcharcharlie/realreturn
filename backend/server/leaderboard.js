const { getInvestmentReturnRecords } = require('./firestore')

async function getLeaderboardData(req, res) {
  let time_span = req.body.time_span
  let gain_or_loss = req.body.gain_or_loss
  let max_records = req.body.max_records

  if (!time_span || !gain_or_loss || !max_records) {
    res.status(400).send('Not valid');
    return;
  }

  return {
    "data": await getInvestmentReturnRecords(time_span, gain_or_loss, max_records)
  }
}

module.exports = { getLeaderboardData };