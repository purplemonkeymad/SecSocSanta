import os
from flask import Flask, request

app = Flask(__name__)

# helper functions

# endpoints
@app.route('/game', methods=['GET','POST'])
def game():
    return 'hello'
# For dev local runs, start flask in python process.

if __name__ == '__main__':
    port = int(os.environ.get('PORT',5000))
    app.run(host='0.0.0.0', port=port)