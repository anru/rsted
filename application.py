#!/usr/bin/env python2
# all the imports
import os, sys
reload(sys)
sys.setdefaultencoding('utf-8')

import redis

from flask import Flask, request, render_template, make_response

from rsted.html import rst2html as _rst2html
from rsted.pdf import rst2pdf as _rst2pdf


# create our little application :)
app = Flask(__name__)
app.config.from_pyfile(os.environ.get('RSTED_CONF', 'settings.py'))

def connect_redis():
    return redis.Redis(host=app.config.get('REDIS_HOST', 'localhost'), port=app.config.get('REDIS_PORT', 6379), db=app.config.get('REDIS_DB', 0))

@app.context_processor
def ctx_pro():
    return {
        'MEDIA_URL': '/static/'
    }

@app.route("/")
def index():
    saved_doc_id = request.args.get('n')
    rst = ''
    if saved_doc_id:
        r = connect_redis()
        saved_doc = r.get(saved_doc_id)
        if saved_doc:
            rst = saved_doc
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

@app.route('/srv/rst2pdf/', methods=['POST'])
def rst2pdf():
    rst = request.form.get('rst', '')
    theme = request.form.get('theme')
    if theme == 'basic':
        theme = None

    pdf = _rst2pdf(rst, theme=theme)
    responce = make_response(pdf)
    responce.headers['Content-Type'] = 'application/pdf'
    responce.headers['Content-Disposition'] = 'attachment; filename="rst.pdf"'
    responce.headers['Content-Transfer-Encoding'] = 'binary'
    return responce

@app.route('/srv/save_rst/', methods=['POST'])
def save_rst():
    rst = request.form.get('rst')
    if not rst:
        return ''
    
    from hashlib import md5
    r = connect_redis()
    
    hash = md5(rst).hexdigest()
    r.setnx(hash, rst)
    r.save()
    response = make_response(hash)
    response.headers['Content-Type'] = 'text/plain'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0')

