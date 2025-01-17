import ssl

import aiohttp

from core.config import TON_CONNECT_URL, TON_CONNECT_API_KEY

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE


class TonService:
    @staticmethod
    async def get_address_from_ton(address: str):
        async with aiohttp.ClientSession(
                connector=aiohttp.TCPConnector(ssl_context=ssl_context)
        ) as session:
            async with session.get(
                    f'{TON_CONNECT_URL}/detectAddress?address={address}',
                    headers={
                        'Accept': 'application/json',
                    }
            ) as response:
                if response.status == 200:
                    res = await response.json()
                    return res['result']['bounceable']['b64url']
                else:
                    error_message = await response.text()
                    raise Exception(
                        f"Request failed with status {response.status}. Error message: {error_message}"
                    )

    @staticmethod
    async def get_transactions(address: str, limit: int = 3):
        async with aiohttp.ClientSession(
                connector=aiohttp.TCPConnector(ssl_context=ssl_context)
        ) as session:
            async with session.get(
                    f'{TON_CONNECT_URL}/getTransactions?address={address}&limit=3&archival=true',
                    headers={
                        'Accept': 'application/json',
                    }

            ) as response:
                if response.status == 200:
                    res = await response.json()
                    return res['result']
                else:
                    error_message = await response.text()
                    raise Exception(
                        f"Request failed with status {response.status}. Error message: {error_message}"
                        )

