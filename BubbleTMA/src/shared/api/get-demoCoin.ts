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
	const getDemoWithoutAuth = async(uuId: string) => {
		const res = await api<number>({
			url: `/api/games/get-demo-coin-without-auth?sessionId=${uuId}`,
			method: 'POST'
		})
		if (res.data)
		dispatch(setDemoBalance(res.data))
	}
	const updateDemoCoinWithoutAuth = async(uuId: string, amount: string | number) => {
		await api<number>({
			url: `/api/games/update-demo-coin-without-auth?sessionId=${uuId}&amount=${amount}`,
			method: 'PATCH'
		})
	}
	const updateDemoCoin = async(userId: string, amount: string | number) => {
		await api<number>({
			url: `/api/games/update-coin?userId=${userId}&amount=${amount}`,
			method: 'PATCH'
		})
	}
	const removeDemoCoinWithoutAuth = async(uuId: string, amount: string | number) => {
		await api<number>({
			url: `/api/games/remove-demo-coin-without-auth?sessionId=${uuId}&amount=${amount}`,
			method: 'PATCH'
		})
	}

	const removeDemoCoin = async(userId: string, amount: string | number) => {
		await api<number>({
			url: `/api/games/remove-demo-coin?userId=${userId}&amount=${amount}`,
			method: 'PATCH'
		})
	}
	return {getDemoCoin, getDemoWithoutAuth, updateDemoCoinWithoutAuth, updateDemoCoin, removeDemoCoinWithoutAuth, removeDemoCoin}
}