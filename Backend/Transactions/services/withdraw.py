from pathlib import Path

import requests
from pytonlib import TonlibClient
from tonsdk.contract.wallet import Wallets, WalletVersionEnum
from tonsdk.utils import to_nano


def mnemonic() -> list[str]:
    return ['moon', 'pipe', 'side', 'tribe', 'brief', 'replace', 'beach', 'cost', 'clog', 'coast', 'few', 'rotate', 'fork', 'that', 'trouble', 'strong', 'nothing', 'garage', 'panther', 'patch', 'scene', 'tray', 'wife', 'shadow']


async def get_seqno(client: TonlibClient, address: str) -> int:
    data = await client.raw_run_method(method='seqno', stack_data=[], address=address)
    return int(data['stack'][0][1])

async def transfer_coins(amount: float, address: str, payload: str = None):
    mnemonics, pub_k, pr, wallet = Wallets.from_mnemonics(
        version=WalletVersionEnum.v3r2,
        workchain=0, mnemonics=mnemonic()
        )
    ton_config = requests.get('https://ton.org/global-config.json').json()

    keystore_dir = '/tmp/ton_keystore'
    Path(keystore_dir).mkdir(parents=True, exist_ok=True)

    client = TonlibClient(
        ls_index=0,
        config=ton_config,
        keystore=keystore_dir,
    )

    await client.init()

    transfer_query = wallet.create_transfer_message(
        to_addr=address, amount=to_nano(amount, 'ton'),
        seqno=1, payload='withdraw' if payload is None else payload
    )
    transfer_message = transfer_query['message'].to_boc(False)

    await client.raw_send_message(transfer_message)
    await client.close()