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

const {google} = require('googleapis');
const nconf = require('nconf');
const readline = require('readline');
const plus = google.plus('v1');
const path = require('path');
const OAuth2Client = google.auth.OAuth2;

const fs = require('fs');
const { exec } = require('child_process');
const stringify = require('stringify');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

nconf.argv().env().file(path.join(__dirname, '/oauth2.keys.json'));
const keys = nconf.get('web');

let port = process.env.PORT || 8080;

app.set('port', port);

app.use(morgan('dev'));

// Client ID and client secret are available at
// https://code.google.com/apis/console
const CLIENT_ID = '776658847597-e9i08djipjkou2kip3qadkov0tuv3ci6.apps.googleusercontent.com';
const CLIENT_SECRET = 'q1xDhh2J_kqGCN3lNSy30K2Q';
const TOKEN_URI = 'https://accounts.google.com/o/oauth2/token';
const REDIRECT_URL = 'http://localhost:8080/redirect';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

const url = oauth2Client.generateAuthUrl({
access_type: 'offline', // will return a refresh token
scope: SCOPES // can be a space-delimited string or an array of scopes
});

console.log('oauth url => ', url)

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.route('/home')
    .get((req, res) => {
        res.sendFile(path.join(__dirname,'home.html'));
    })

app.route('/redirect')
    .get((req, res) => {
        let code = req.query.code || null;

        oauth2Client.getToken(code, (err, tokens) => {
            if (err) {
                return err;
            }
            // set tokens to the client
            // TODO: tokens should be set by OAuth2 client.
            oauth2Client.setCredentials(tokens);

             let data_json = {
                'token': tokens.access_token,
                'token_uri': TOKEN_URI,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'scopes': SCOPES
                };

            saveIDToPublicFolder(data_json, function(error) {
            
                if (error) {
                    console.log('error')
                    console.log(err)
                    res.status(404).send('Spreadsheed ID not sent.');
                    return;
                }
                res.sendFile(path.join(__dirname,'test.html'));
            });
            console.log('you posted: json: ' + data_json);
        });
        
    });

app.get('/oauth', (req, res) => {
    res.redirect(url);
});

app.get('/python', (req, res) => {
     exec('python python_google_spreadsheet/get_data.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send({error: 'python failed! ' + error})
            return;
        }
        console.log(`stdout: ${stdout}`)
        res.json(stdout);
    });
})

function saveIDToPublicFolder(id, callback) {
    fs.writeFile('./python_google_spreadsheet/code.json', JSON.stringify(id), callback);
}

app.listen(app.get('port'), function() {
    console.log('listening on ', port)
});