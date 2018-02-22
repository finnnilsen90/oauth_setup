import flask

state = flask.session['state']
flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    'client_secret.json',
    scopes=['https://www.googleapis.com/auth/youtube.force-ssl'],
    state=state)
flow.redirect_uri = flask.url_for('oauth2callback', _external=True)

def get_credentials_v2():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    param_file = dir_path + '/code.json'

    with open(param_file) as data_file:
        data = json.load(data_file)

    code = data['code']
    return code

authorization_response = get_credentials_v2()
flow.fetch_token(authorization_response=authorization_response)

credentials = flow.credentials

print('credentials => ' + str(credentials))