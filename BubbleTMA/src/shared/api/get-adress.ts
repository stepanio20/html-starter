import { useDispatch } from 'react-redux'
import useApi from '../../api/apiHandler'
import { setDepositAddress } from '../../slices/UserSlide'

export default function useGetAddressApi() {
  const dispatch = useDispatch()
  const api = useApi()
  const getAddress = async () => {
   const res = await api<string>({
    url: `/api/payments/get-address`,
    method: 'GET'
   })
   if (res?.data) {
    dispatch(setDepositAddress(res?.data))
   }
  };

  return { getAddress };
}
