from fastapi import FastAPI, Depends, Path, HTTPException
from typing import Union
from pydantic import BaseModel
from database import Engineconn
from models import Transaction
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError


app = FastAPI()
engine = Engineconn()
session = engine.sessionmaker()

class TransactionCreate(BaseModel):
    value: float
    description: str

def pydantic_to_sqlalchemy(transaction_create: TransactionCreate) -> Transaction:
    return Transaction(value=transaction_create.value, description=transaction_create.description)


@app.post("/transaction")
async def create_transaction(transaction_create: TransactionCreate):
    transaction_sqlalchemy = pydantic_to_sqlalchemy(transaction_create)
    session.add(transaction_sqlalchemy)
    session.commit()
    session.close()
    return transaction_create

@app.get("/health")
async def health_check():
    try:
        session.query(Transaction).first()
        return {"status": "ok"}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        session.close()

@app.get("/transaction/{transaction_id}")
async def get_transaction(transaction_id: int):
    transaction = session.query(Transaction).filter(Transaction.transaction_id.in_([transaction_id])).all()
    return transaction


@app.get("/transactions")
async def get_transactions():
    transactions = session.query(Transaction).all()
    return transactions

@app.delete("/transaction/{transaction_id}")
async def delete_transaction(transaction_id: int):
    transaction = session.query(Transaction).filter_by(transaction_id=transaction_id).first()
    if transaction:
        session.delete(transaction)
        session.commit()
        return {"message": "Transaction deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Transaction not found")