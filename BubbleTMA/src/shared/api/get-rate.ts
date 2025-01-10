import { useDispatch } from 'react-redux'
import useApi from '../../api/apiHandler'
import { setUsdtRate } from '../../slices/UserSlide'

export default function useGetCoinRate() {
	const api = useApi()
	const dispatch = useDispatch()
	const getUsdtRate = async() => {
		const res = await api<number>({
			url: `/api/payments/get-usdt-price`,
			method: 'GET'
		})
		if (res?.data)
		dispatch(setUsdtRate(res?.data))
	}
	return{getUsdtRate}
}