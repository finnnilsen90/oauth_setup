from __future__ import print_function
import httplib2
import os
import re

import json

from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage

import flask
import requests

import google.oauth2.credentials
import google_auth_oauthlib.flow
import googleapiclient.discovery

try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None

# If modifying these scopes, delete your previously saved credentials
# at ~/.credentials/sheets.googleapis.com-python-quickstart.json
SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'
CLIENT_SECRET_FILE = 'client_secret.json'
API_SERVICE_NAME = 'sheets'
API_VERSION = 'v4'
APPLICATION_NAME = 'Campaign Master QA'

def get_credentials():
    """Gets valid user credentials from storage.

    If nothing has been stored, or if the stored credentials are invalid,
    the OAuth2 flow is completed to obtain the new credentials.

    Returns:
        Credentials, the obtained credential.
    """

    home_dir = os.path.expanduser('~')
    credential_dir = os.path.join(home_dir, '.credentials')
    if not os.path.exists(credential_dir):
        os.makedirs(credential_dir)
    credential_path = os.path.join(credential_dir,
                                   'sheets.googleapis.com-python-quickstart.json')

    store = Storage(credential_path)
    credentials = store.get()
    if not credentials or credentials.invalid:
        flow = client.flow_from_clientsecrets(CLIENT_SECRET_FILE, SCOPES)
        flow.user_agent = APPLICATION_NAME
        if flags:
            credentials = tools.run_flow(flow, store, flags)
        else: # Needed only for compatibility with Python 2.6
            credentials = tools.run(flow, store)
        print('Storing credentials to ' + credential_path)
    return credentials

def get_credentials_v2():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    param_file = dir_path + '/code.json'

    with open(param_file) as data_file:
        data = json.load(data_file)

    code = data
    return code


credentials = get_credentials()
http = credentials.authorize(httplib2.Http())
discoveryUrl = ('https://sheets.googleapis.com/$discovery/rest?'
                'version=v4')
service = discovery.build(API_SERVICE_NAME, API_VERSION, http=http,
                            discoveryServiceUrl=discoveryUrl)

dir_path = os.path.dirname(os.path.realpath(__file__))
param_file = dir_path + '/spreadsheet.json'

with open(param_file) as data_file:
    data = json.load(data_file)

spreadsheetId = data['spreadsheet_id']
rangeName = 'Sheet1!A1:B2'
result = service.spreadsheets().values().get(
    spreadsheetId=spreadsheetId, range=rangeName).execute()
values = result.get('values', [])

print('Spreadsheet Data Below')
print('')
print(values) 