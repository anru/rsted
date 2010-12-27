#!/usr/bin/python
import os
from flup.server.fcgi import WSGIServer
from application import app

socket_path = app.config.get('SOCKET', os.path.join(app.config.root_path, 'rsted.fcgi'))

WSGIServer(app, bindAddress=socket_path).run()

