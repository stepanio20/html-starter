from tonsdk.utils import Address
from tonutils.wallet import WalletV3R2
from pytoniq_core import Address, begin_cell

from tonutils.client import TonapiClient
from tonutils.jetton import JettonMaster, JettonWallet

from core.config import MNEMONIC, TON_CONNECT_API_KEY, USDT_ADDRESS

# async def transfer_coins(amount: float, address: str, payload: str = None):
#     provider = TonCenterClient()
#     wallet = Wallet(mnemonics=MNEMONIC, version='v3r2', provider=provider)
#     print(f'Send transaction to {address}')
#     await wallet.transfer_ton(
#         address, amount=amount,
#         message='withdraw' if payload is None else payload
#         )
#     print(f'Successfully sent transaction to {address} {amount}')

JETTON_DECIMALS = 6

async def transfer_coins(amount: float, address: str, payload: str = None):
    client = TonapiClient(api_key=TON_CONNECT_API_KEY, is_testnet=False)
    wallet, _, _, _ = WalletV3R2.from_mnemonic(client, MNEMONIC)

    jetton_wallet_address = await JettonMaster.get_wallet_address(
        client=client,
        owner_address=wallet.address.to_str(),
        jetton_master_address=USDT_ADDRESS,
    )

    body = JettonWallet.build_transfer_body(
        recipient_address=Address(address),
        response_address=wallet.address,
        jetton_amount=int(amount * (10 ** JETTON_DECIMALS)),
        forward_payload=(
            begin_cell()
            .store_uint(0, 32)
            .store_snake_string("" if payload is None else payload)
            .end_cell()
        ),
        forward_amount=1,
    )

    tx_hash = await wallet.transfer(
        destination=jetton_wallet_address,
        amount=0.05,
        body=body,
    )

    print(f'addr: {tx_hash} account: {address} amount: {amount}')