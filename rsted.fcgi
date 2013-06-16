#!/usr/bin/env python2

import os
from os.path import join as J
from pwl.fastcgi import runfastcgi
from application import app

full_run_path = J(app.config.root_path, app.config.get('RUN_PATH', 'var/run'))

if not os.path.isdir(full_run_path):
    os.mkdir(full_run_path)

# default options
fcgi_opts = {
    'daemonize': 'yes',
    'pidfile': os.path.join(full_run_path, app.config.get('PID_FILE', 'fastcgi.pid')),
    'method': 'prefork',
    'socket': os.path.join(full_run_path, app.config.get('SOCKET_FILE', 'rsted.sock')),
    'workdir': app.config.root_path,
    'maxrequests': 100,
    'umask': app.config.get('FCGI_UMASK', '002')
}

run_as = app.config.get('RUN_AS')
if run_as:
    fcgi_opts['run_as'] = run_as

args=[]
runfastcgi(app, args, **fcgi_opts)
