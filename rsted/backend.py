import os.path

from application import app


class FileBackend:
    def __init__(self, root_path):
        self.root_path = os.path.abspath(root_path)
        FileBackend.__verify_db_root_exist(self.root_path)

    @staticmethod
    def __verify_db_root_exist(db_root_path):
        if not os.path.exists(db_root_path):
            os.makedirs(db_root_path)

    def create(self, name):
        filepath = os.path.join(self.root_path, name)
        with open(filepath, 'a'):
            os.utime(filepath, None)

    def update(self, name, content):
        filepath = os.path.join(self.root_path, name)
        with open(filepath, 'w') as f:
            f.write(content)

    def delete(self, name):
        filepath = os.path.join(self.root_path, name)
        os.remove(filepath)

    def list(self):
        return [f for f in os.listdir(self.root_path)
                if os.path.isfile(os.path.join(self.root_path, f))]


rst_db = FileBackend(app.config.get('INPUT_DIR', './db/rst'))
html_db = FileBackend(app.config.get('OUTPUT_DIR', './db/html'))
