const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

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

module.exports = { getInvestmentReturnRecords };