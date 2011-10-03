from __future__ import absolute_import
import redis
from flask import g

class RedisManager(object):

    def __init__(self, app=None):

        if app is not None:
            self.init_app(app)
        else:
            self.app = None
            self.instance = None

    def init_app(self, app):
        """
        Used to initialize redis with app object
        """

        app.config.setdefault('REDIS_HOST', 'localhost')
        app.config.setdefault('REDIS_PORT', 6379)
        app.config.setdefault('REDIS_DB', 0)
        app.config.setdefault('REDIS_PASSWORD', None)

        self.app = app
        self._connect()


    def _connect(self):
        self.instance = redis.Redis(host=self.app.config['REDIS_HOST'],
                           port=self.app.config['REDIS_PORT'],
                           db=self.app.config['REDIS_DB'],
                           password=self.app.config['REDIS_PASSWORD'])

    def get_instance(self):
        return self.instance
