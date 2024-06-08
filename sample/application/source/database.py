import os
from sqlalchemy import *
from sqlalchemy.orm import sessionmaker, scoped_session


class Engineconn:

    def __init__(self):
        self.engine = create_engine(self.create_db_url(), pool_size=20, pool_recycle = 500, max_overflow=20)

    def create_db_url(self):
        username = os.getenv('DB_USERNAME', 'admin')
        password = os.getenv('DB_PASSWORD', 'default_password')
        host = os.getenv('DB_HOST', 'localhost')
        port = os.getenv('DB_PORT', '3306')
        dbname = os.getenv('DB_NAME', 'monitoring')

        return f'mysql+pymysql://{username}:{password}@{host}:{port}/{dbname}'

    def sessionmaker(self):
        return scoped_session(sessionmaker(bind=self.engine))

    def connection(self):
        conn = self.engine.connect()
        return conn