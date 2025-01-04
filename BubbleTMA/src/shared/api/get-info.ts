import { useDispatch } from 'react-redux'
import useApi from '../../api/apiHandler'
import { setBalance } from '../../slices/GameSlide'
interface GetInfoInt {
  balance: number
}

export default function useGetInfoApi() {
  const dispatch = useDispatch()
  const api = useApi()
  const getInfo = async (userId:string) => {
    const res = await api<GetInfoInt>({
      url: `/api/games/get-info`,
      method: 'POST',
      data: {
        userId
      }
    })
    if (res?.data) {
      dispatch(setBalance(res?.data?.balance))
    }
  };

  return { getInfo };
}
