from sqlalchemy import Column, TEXT, INT, Numeric
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(INT, nullable=False, autoincrement=True, primary_key=True)
    value = Column(Numeric(precision=10, scale=2), nullable=False)
    description = Column(TEXT, nullable=False)