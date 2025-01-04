import { useDispatch } from 'react-redux'
import { setDepositAddress } from '../../slices/GameSlide'

export default function useGetAddressApi() {
  const dispatch = useDispatch()

  const getAddress = async () => {
    try {
      const response = await fetch(`http://localhost:5225/api/payments/get-address`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: string = await response.json();
      dispatch(setDepositAddress(data))
    } catch (error) {
      console.error('Error fetching game info:', error);
      throw error;
    }
  };

  return { getAddress };
}
