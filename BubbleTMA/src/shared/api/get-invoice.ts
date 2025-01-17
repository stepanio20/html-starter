import axios from 'axios'
export interface InvoiceResponse {
	invoice_link: string
}

const useInvoiceApi = () => {
	const getInvoiceAddress = async (amount:number) => {
		try {
			const response = await axios.post<InvoiceResponse>(`http://localhost:8000/api/donate`, {
				amount: amount,
			});
			return response.data?.invoice_link;
		} catch (error) {
			console.error('Error fetching invoice address:', error);
		}
	};
	

	return {getInvoiceAddress}
}
export default useInvoiceApi