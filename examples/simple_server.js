// Copyright 2012-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const app = express();

const {google} = require('googleapis');
const nconf = require('nconf');
const readline = require('readline');
const plus = google.plus('v1');
const path = require('path');
const OAuth2Client = google.auth.OAuth2;

nconf.argv().env().file(path.join(__dirname, '/oauth2.keys.json'));
const keys = nconf.get('web');


// Client ID and client secret are available at
// https://code.google.com/apis/console
const CLIENT_ID = keys.client_id;
const CLIENT_SECRET = keys.client_secret;
const REDIRECT_URL = keys.redirect_uris[0];

// const CLIENT_ID = '776658847597-e9i08djipjkou2kip3qadkov0tuv3ci6.apps.googleusercontent.com';
// const CLIENT_SECRET = 'q1xDhh2J_kqGCN3lNSy30K2Q';
// const REDIRECT_URL = 'http://localhost:8080';

let port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'home.html'));
});

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getAccessToken (oauth2Client, callback) {
  // generate consent page url
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly' // can be a space-delimited string or an array of scopes
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', code => {
    // request access token
    oauth2Client.getToken(code, (err, tokens) => {
      if (err) {
        return callback(err);
      }
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
      oauth2Client.setCredentials(tokens);
      callback();
    });
  });
}

// retrieve an access token
getAccessToken(oauth2Client, () => {
  // retrieve user profile
  plus.people.get({ userId: 'me', auth: oauth2Client }, (err, profile) => {
    if (err) {
      throw err;
    }
    console.log(profile.displayName, ':', profile.tagline);
  });
});

app.listen(app.get('port'), function() {
    console.log('listening on ', port)
});