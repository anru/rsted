
import os
from os.path import join as J
import sys
from flask import current_app as app
from subprocess import Popen, PIPE
import codecs

utf8codec = codecs.lookup('utf-8')

def _popen(cmd, input=None, **kwargs):
    kw = dict(stdout=PIPE, stderr=PIPE, close_fds=os.name != 'nt', universal_newlines=True)
    if input is not None:
        kw['stdin'] = PIPE
    kw.update(kwargs)
    p = Popen(cmd, shell=True, **kw)
    return p.communicate(input)

default_rst_opts = {
    'no-generator': None,
    'no-source-link': None,
    'tab-width': 4
}

def make_opts(d):
    result = []
    for key, value in d.items():
        r = '='.join([str(x) for x in ('--%s' % key, value) if x is not None])
        result.append(r)
    return ' '.join(result)

def rst2html(rst, theme=None, opts=None):
    rst_opts = default_rst_opts.copy()
    if opts:
        rst_opts.update(opts)
    rst_opts['template'] = 'var/themes/template.txt'
    
    stylesheets = ['basic.css']
    if theme:
        stylesheets.append('%s/%s.css' % (theme, theme))
    rst_opts['stylesheet'] = ','.join([J('var/themes/', p) for p in stylesheets ])
    
    cmd = '%s %s' % (app.config['RST2HRML_CMD'], make_opts(rst_opts))
    out, errs = _popen(cmd, utf8codec.encode(rst), cwd=app.config.root_path)
    if errs and not out:
        return errs
    
    return out
    