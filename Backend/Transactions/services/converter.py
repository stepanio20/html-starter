# import asyncio
#
# from pytonlib import TonlibClient verify transaction
# from pytonlib.utils.tlb import Transaction, Slice, Cell, deserialize_boc
#
# from tonsdk.utils import b64str_to_bytes
#
# import requests
# from pathlib import Path
#
# from services.ton import TonService
#
#
# async def get_client():
#     url = 'https://ton.org/global-config.json'
#
#     config = requests.get(url).json()
#
#     keystore_dir = '/tmp/ton_keystore'
#     Path(keystore_dir).mkdir(parents=True, exist_ok=True)
#
#     client = TonlibClient(ls_index=0, config=config, keystore=keystore_dir, tonlib_timeout=10)
#
#     await client.init()
#
#     return client
#
#
# async def main():
#     trs = await TonService().get_transactions(
#         address='EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG', limit=10)
#
#     for tr in trs:
#         cell = deserialize_boc(b64str_to_bytes(tr['data']))
#         tr_data = Transaction(Slice(cell))
#         com_ph = tr_data.description.compute_ph
#         act_ph = tr_data.description.action
#         if com_ph.type == 'tr_phase_compute_vm':
#             if com_ph.exit_code == 1 or com_ph.exit_code == 0:
#                 return True
#         if act_ph is not None:
#             if act_ph.exit_code == 1 or act_ph.exit_code == 0:
#                 return True
#
#
# if __name__ == '__main__':
#     asyncio.get_event_loop().run_until_complete(main())