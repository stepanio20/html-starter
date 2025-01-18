import asyncio
from aiogram import Bot, Dispatcher, F, types
from aiogram.types import Message, Update, WebAppInfo, LabeledPrice, PreCheckoutQuery
from aiogram.filters import CommandStart
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.methods import CreateInvoiceLink
from pydantic import BaseModel
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config_reader import Config

config = Config()

API_TOKEN = '7614536190:AAGuGQHxHu-iv8B_4KsVT9TA8wKuyJeuHjA'
API_URL = 'https://tgmochapi.devmainops.store'
WEB_APP_URL = "https://client.camelracing.io/"
bot = Bot(token="7614536190:AAGuGQHxHu-iv8B_4KsVT9TA8wKuyJeuHjA")
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

markup = (
    InlineKeyboardBuilder()
    .button(text="Open me", web_app=WebAppInfo(url=WEB_APP_URL))
    .as_markup()
)

@dp.message(CommandStart())
async def start(message: Message) -> None:
    await message.answer("/start", reply_markup=markup)

@app.post("/api/donate", response_class=JSONResponse)
async def donate(request: RequestModel) -> JSONResponse:
    invoice_link = await bot(
        CreateInvoiceLink(
            title="Donate",
            description="Description",
            payload="donate",
            currency="XTR",
            prices=[LabeledPrice(label="XTR", amount=request.amount)]
        )
    )
    return JSONResponse({"invoice_link": invoice_link})

@dp.pre_checkout_query()
async def pre_checkout_query(event: PreCheckoutQuery) -> None:
    await event.answer(True)

@dp.message(F.successful_payment)
async def successful_payment(message: types.Message) -> None:
    await message.answer("Thanks for donate")

async def start_fastapi():
    config_uvicorn = uvicorn.Config(app, host=config.APP_HOST, port=config.APP_PORT, log_level="info")
    server = uvicorn.Server(config_uvicorn)
    await server.serve()

async def start_bot():
    await dp.start_polling(bot)

async def main():
    await asyncio.gather(
        start_fastapi(),
        start_bot()
    )

if __name__ == "__main__":
    asyncio.run(main())
