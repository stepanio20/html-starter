import { useDispatch } from 'react-redux'
import useApi from '../../api/apiHandler'
import { setPlayersOnline } from '../../slices/UserSlide'


export default function useGetPlayersApi() {
	const api = useApi()
	const dispatch = useDispatch()
	const getPlayersOnline = async() => {
		const res = await api<number>({
			url: `/api/get-players`,
			method: 'GET'
		})
		dispatch(setPlayersOnline(res?.data as number))
	}
	return {getPlayersOnline}
}