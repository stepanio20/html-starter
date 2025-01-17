from TonTools.Contracts.Wallet import Wallet
from TonTools.Providers.TonCenterClient import TonCenterClient

from core.config import MNEMONIC

async def transfer_coins(amount: float, address: str, payload: str = None):
    provider = TonCenterClient()
    wallet = Wallet(mnemonics=MNEMONIC, version='v3r2', provider=provider)
    print(f'Send transaction to {address}')
    await wallet.transfer_ton(
        address, amount=amount,
        message='withdraw' if payload is None else payload
        )
    print(f'Successfully sent transaction to {address} {amount}')