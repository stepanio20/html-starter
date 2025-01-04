import { useDispatch } from 'react-redux'
import { setBalance } from '../../slices/GameSlide'
interface GetInfoInt {
  balance: number
}

export default function useGetInfoApi() {
  const dispatch = useDispatch()
  const getInfo = async (userId:string) => {
    try {
      const response = await fetch('http://localhost:5225/api/games/get-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data:GetInfoInt = await response.json();
      dispatch(setBalance(data?.balance))
    } catch (error) {
      console.error('Error fetching game info:', error);
      throw error;
    }
  };

  return { getInfo };
}
