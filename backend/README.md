
## Available Scripts

In the project directory, you can run:

### `npm ci`

Installs dependencies

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.

### `npm test`

Runs all the unit tests.

### `push protocol`

For testing purpose, go to https://staging.push.org/#/inbox and connect your wallet.
Go to Channels, search for ETHHackathonSF and then click Opt-In

### `local test`

`curl -X POST http://localhost:3001/api/fake`

### `node server/dune.js`

For loading dune query data.


curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"amount":1}' \
  http://localhost:3001/api/erabridge/get_percentile

### `Deploying to firebase`

[ONLY THE FIRST TIME]

Install firebase CLI: https://firebase.google.com/docs/cli#install_the_firebase_cli

`firebase login`

`firebase init` and select `functions`

Revert all automatic changes to `firebase.json` or other files in the repository

[ALL OTHER TIMES]

`firebase deploy`
