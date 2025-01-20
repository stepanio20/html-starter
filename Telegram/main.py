import asyncio

from aiogram.filters import Command
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
import requests
import uvicorn
from aiogram import Bot, Dispatcher, types, F
from aiogram.methods import CreateInvoiceLink
from aiogram.types import (
    InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, LabeledPrice, PreCheckoutQuery
)
from starlette.responses import JSONResponse

API_TOKEN = '7614536190:AAGuGQHxHu-iv8B_4KsVT9TA8wKuyJeuHjA'
WEB_APP = 'https://h2441kvp-5173.euw.devtunnels.ms/'
API_URL = 'https://tgmochapi.devmainops.store'#todo
bot = Bot(token=API_TOKEN)
dp = Dispatcher()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestModel(BaseModel):
    amount: int

async def send_welcome_async(message: types.Message):
    button_start = InlineKeyboardButton(text="Start🚀", web_app=WebAppInfo(url=WEB_APP))
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[button_start]])
    await bot.send_message(message.from_user.id, text="Start", parse_mode='HTML', reply_markup=keyboard)

@dp.message(Command('start'))
async def start(message: types.Message):
    await send_welcome_async(message)

@dp.callback_query(F.data)
async def process_callback(callback_query: types.CallbackQuery):
    pass

@app.post("/api/donate", response_class=JSONResponse)
async def donate(request: RequestModel) -> JSONResponse:
    invoice_link = await bot(
        CreateInvoiceLink(
            title="Donate",
            description="Description",
            payload="donate",
            currency="XTR",
            prices=[LabeledPrice(label="XTR", amount=request.amount)],
            provider_token=""
        )
    )
    return JSONResponse({"invoice_link": invoice_link})

@dp.pre_checkout_query()
async def pre_checkout_query(event: PreCheckoutQuery) -> None:
    await event.answer(True)

@dp.message(F.successful_payment)
async def successful_payment(message: types.Message) -> None:
    await message.answer("Thanks for donate")

async def start_api():
    config_uvicorn = uvicorn.Config(app, host='localhost', port=8001, log_level="info")
    server = uvicorn.Server(config_uvicorn)
    await server.serve()

async def start_bot():
    await dp.start_polling(bot)

async def main():
    await asyncio.gather(
        start_api(),
        start_bot()
    )

if __name__ == "__main__":
    asyncio.run(main())