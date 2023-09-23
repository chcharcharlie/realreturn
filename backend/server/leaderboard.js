const { getData } = require('./firebase');
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const timespanToStr = {
  "0": "week",
  "1": "month",
  "2": "year",
}

const brokerageToStr = {
  "0": "Robinhood",
}

const attesterToStr = {
  "0xae85c77f7318bdd466885d21e0875a40ec3657d2": "Jomo"
}

async function getInvestmentReturnRecords(time_span, gain_or_loss, max_records) {
  const snapshots = await db.collection("investment_returns")
    .where("time_span", "==", time_span)
    .orderBy("return_number", gain_or_loss === "positive" ? "desc" : "asc")
    .limit(max_records)
    .get();

  documentations = []
  snapshots.docs.forEach(doc => {
    if ((gain_or_loss === "positive" && doc.data()["return_number"] >= 0)
      || (gain_or_loss !== "positive" && doc.data()["return_number"] < 0)) {
      documentations.push(doc.data());
    }
  })
  return documentations;
}

async function addInvestmentReturnRecord(
  account, account_type, brokerage, time_span,
  positive_return, negative_return, attester, timestamp,
  unique_id,
) {
  const return_number = positive_return > 0 ? positive_return : 0 - negative_return
  await db.collection("investment_returns").add({
    account: account,
    account_type: account_type,
    brokerage: brokerage,
    time_span: time_span,
    return_number: return_number,
    attester: attester,
    attested_at: new Date(timestamp),
    unique_id: unique_id,
  })
}

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

async function shareToLeaderboard(req, res) {
  let session_id = req.body.session_id
  let account_type = req.body.account_type
  let account = req.body.account

  if (!session_id || !account_type || !account) {
    res.status(400).send('Not valid');
    return;
  }

  var session = null
  if (account_type === "evm") {
    session = await getData('wallet_to_session/evm/' + account + '/')
  }

  if (!session || session.session_id !== session_id) {
    res.status(401).send('Not authorized');
    return;
  }

  const sessionResult = await getData('session_results/' + session_id + '/')
  try {
    await addInvestmentReturnRecord(
      account, account_type, brokerageToStr[sessionResult.result_values[0]], timespanToStr[sessionResult.result_values[1]],
      parseInt(sessionResult.result_values[2]), parseInt(sessionResult.result_values[3]), attesterToStr[sessionResult.attester], sessionResult.timestamp,
      sessionResult.unique_id,
    )
  } catch (e) {
    return {
      error: str(e)
    }
  }

  return {
    shared: true,
  }
}

module.exports = { getLeaderboardData, shareToLeaderboard };