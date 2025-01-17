from functools import wraps
from fastapi import Request, HTTPException

from core.config import ACCESS_TOKEN


def authorize(token_name: str = "X_TOKEN"):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            if not request:
                raise HTTPException(status_code=400, detail="Request object is missing")

            token = request.headers.get(token_name)
            if token != ACCESS_TOKEN:
                raise HTTPException(status_code=401, detail="Not authorized")
            return await func(*args, **kwargs)

        return wrapper

    return decorator