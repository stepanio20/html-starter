import asyncio

from aiogram.filters import Command
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
import requests
import uvicorn
from aiogram import Bot, Dispatcher, types, F
from aiogram.methods import CreateInvoiceLink
from aiogram.types import (
    InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
)

API_TOKEN = '7614536190:AAGuGQHxHu-iv8B_4KsVT9TA8wKuyJeuHjA'
WEB_APP = 'https://h2441kvp-5173.euw.devtunnels.ms/'
API_URL = 'https://tgmochapi.devmainops.store'#todo
bot = Bot(token=API_TOKEN)
dp = Dispatcher()

async def send_welcome_async(message: types.Message):
    button_start = InlineKeyboardButton(text="Start🚀", web_app=WebAppInfo(url=WEB_APP))
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[button_start]])
    await bot.send_message(
        message.from_user.id, text=welcome_text, parse_mode='HTML', reply_markup=keyboard
        )


@dp.message(Command('start'))
async def start(message: types.Message):
    await send_welcome_async(message)


@dp.callback_query(F.data)
async def process_callback(callback_query: types.CallbackQuery):
    pass


async def run_bot():
    await dp.start_polling(bot)




async def main():
    await run_bot()


if __name__ == "__main__":
    asyncio.run(main())
