from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

from core.config import ACCESS_TOKEN
from services.withdraw import transfer_coins

app = FastAPI()

class WithdrawSchema(BaseModel):
    amount: float
    address: str

@app.post('/withdraw')
async def withdraw(schema: WithdrawSchema, X_TOKEN:str):
    if X_TOKEN != ACCESS_TOKEN:
        raise HTTPException(detail='Not authorized', status_code=401)
    await transfer_coins(amount=schema.amount, address=schema.address)