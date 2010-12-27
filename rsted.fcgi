#!/usr/bin/python

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
}

args=[]
runfastcgi(args, **fcgi_opts)