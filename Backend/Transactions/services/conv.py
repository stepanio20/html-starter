from pytoniq_core import Address
from tonutils.client import TonapiClient
from tonutils.jetton.dex.stonfi import StonfiRouterV1
from tonutils.utils import to_nano, to_amount
from tonutils.wallet import WalletV3R2

from core.config import TON_CONNECT_API_KEY, MNEMONIC, USDT_ADDRESS

TON_AMOUNT = 0.01

async def convert_ton_to_usdt(amount: float):
    client = TonapiClient(api_key=TON_CONNECT_API_KEY, is_testnet=False)
    wallet, _, _, _ = WalletV3R2.from_mnemonic(client, MNEMONIC)

    to, value, body = await StonfiRouterV1(client).get_swap_ton_to_jetton_tx_params(
        user_wallet_address=wallet.address,
        ask_jetton_address=Address(USDT_ADDRESS),
        offer_amount=to_nano(TON_AMOUNT),
        min_ask_amount=0,
    )

    tx_hash = await wallet.transfer(
        destination=to,
        amount=to_amount(value),
        body=body,
    )

    return tx_hash

