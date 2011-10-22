#!/usr/bin/env python2

import os
from os.path import join as J
from pwl.fastcgi import runfastcgi
from application import app

run_path = J(app.config.root_path, 'var/run')

if not os.path.isdir(run_path):
    os.mkdir(run_path)

# default options
fcgi_opts = {
    'daemonize': 'yes',
    'pidfile': os.path.join(run_path, 'fastcgi.pid'),
    'method': 'prefork',
    'socket': os.path.join(run_path, 'rsted.sock'),
    'workdir': app.config.root_path,
    'maxrequests': 100,
}

run_as = app.config.get('RUN_AS')
if run_as:
    fcgi_opts['run_as'] = run_as

args=[]
runfastcgi(args, **fcgi_opts)
