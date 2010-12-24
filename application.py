
# all the imports
import os
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash, jsonify

from rsted.html import rst2html as _rst2html

import redis

# create our little application :)
app = Flask(__name__)
app.config.from_pyfile(os.environ.get('RSTED_CONF', 'settings.py'))

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

@app.context_processor
def ctx_pro():
    return {
        'MEDIA_URL': '/static/'
    }

@app.route("/")
def index():
    saved_doc_id = request.args.get('n')
    rst = ''
    #if saved_doc_id:
    #    saved_doc = SavedDocument.objects.filter(hash=saved_doc_id)
    #    if saved_doc[:]:
    #        rst = saved_doc[0].rst
    js_params = {'rst': rst, 'theme': request.args.get('theme', '')}
    return render_template('index.html', js_params=js_params)

@app.route('/about/')
def about():
    return render_template('about.html') 

@app.route('/srv/rst2html/', methods=['POST'])
def rst2html():
    rst = request.form.get('rst', '')
    theme = request.form.get('theme')
    if theme == 'basic':
        theme = None
    html = _rst2html(rst, theme=theme)
    return html

if __name__ == '__main__':
    app.run(host='0.0.0.0')

