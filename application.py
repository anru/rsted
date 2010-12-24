
# all the imports
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash
import redis

    
import settings

# create our little application :)
app = Flask(__name__)
app.config.from_object(settings)

def connect_redis():
    return redis.Redis(host='localhost', port=6379, db=0)

r = connect_redis()

@app.before_request
def before_request():
    global r
    try:
        result = r.ping()
    except:
        r = connect_redis()
    else:
        if not result:
            r = connect_redis()
    
@app.route("/")
def hello():
    return "Hello World!"

if __name__ == '__main__':
    app.run(host='0.0.0.0')

