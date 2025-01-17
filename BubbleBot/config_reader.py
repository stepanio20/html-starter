from os.path import join, dirname
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
	WEBHOOK_URL: str = "https://api.camelracing.io/"
	APP_HOST:str = "localhost"
	APP_PORT:int = 8000