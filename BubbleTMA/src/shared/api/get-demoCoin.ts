import { useDispatch } from 'react-redux'
import useApi from '../../api/apiHandler'
import { setDemoBalance } from '../../slices/UserSlide'


export default function useGetDemoCoinApi() {
	const api = useApi()
	const dispatch = useDispatch()
	const getDemoCoin = async(userId: string) => {
		const res = await api<number>({
			url: `/api/games/get-demo-coin?userId=${userId}`,
			method: 'GET'
		})
		if (res.data)
		dispatch(setDemoBalance(res.data))
	}
	return {getDemoCoin}
}