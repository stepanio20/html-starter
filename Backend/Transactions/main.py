from fastapi import FastAPI, Request
from pydantic import BaseModel

from services.conv import convert_ton_to_usdt
from services.withdraw import transfer_coins
from utils.authorize import authorize

app = FastAPI()

class WithdrawSchema(BaseModel):
    amount: float
    address: str

class ConvertSchema(BaseModel):
    amount: float

@app.post('/withdraw')
@authorize()
async def withdraw(schema: WithdrawSchema, request: Request):
    await transfer_coins(amount=schema.amount, address=schema.address)


@app.post('/convert')
@authorize()
async def convert(schema: ConvertSchema, request: Request):
    return await convert_ton_to_usdt(amount=schema.amount)