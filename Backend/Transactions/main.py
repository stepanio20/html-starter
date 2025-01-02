import asyncio
from pathlib import Path

import requests
from TonTools.Contracts.Wallet import Wallet
from aiotx.utils.tonsdk.utils import to_nano
from pytonlib import TonlibClient
from tonsdk.contract.wallet import Wallets, WalletVersionEnum


async def get_seqno(client: TonlibClient, address: str) -> int:
    data = await client.raw_run_method(method='seqno', stack_data=[], address=address)
    return int(data['stack'][0][1])

mnemonic = ['clinic', 'juice', 'plug', 'coyote', 'child', 'age', 'peanut', 'popular', 'stand', 'ozone', 'mad', 'name', 'confirm', 'sentence', 'manual', 'rookie', 'guitar', 'ensure', 'area', 'innocent', 'magnet', 'pass', 'round', 'hungry']
addr = 'EQA2rz6cpSFm5liSPUQaNINTA8WHZKOHGGX0VwC5zxfm7MYb'
async def main():
    mnemonics, pub_k, pr, wallet = Wallets.from_mnemonics(version=WalletVersionEnum.v3r2,
                                                        workchain=0, mnemonics=mnemonic)
    ton_config = requests.get('https://ton.org/global-config.json').json()

    keystore_dir = '/tmp/ton_keystore'
    Path(keystore_dir).mkdir(parents=True, exist_ok=True)

    client = TonlibClient(
        ls_index=0,
        config=ton_config,
        keystore=keystore_dir,
        )

    await client.init()

    query = wallet.create_init_external_message()
    transfer_query = wallet.create_transfer_message(
        to_addr='UQA9VCPtX32dKzRAtuG8uMuViDMVVjNxNwomiUTkbWvqPc6d',amount=to_nano(0.01, 'ton'),
        seqno=1, payload='test')
    transfer_message = transfer_query['message'].to_boc(False)

    await client.raw_send_message(transfer_message)
    await client.close()


if __name__ == '__main__':
    asyncio.run(main())