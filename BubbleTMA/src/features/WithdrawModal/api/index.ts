import useApi from '../../../api/apiHandler'
interface XTRInvoice{
  invoice_link?: string
}
export default function useWithdrawApi() {
  const api = useApi()
  const withdraw = async (userId: string, amount: number) => {
   const res = await api({
    url: `/api/payments/withdraw`,
    method: 'POST',
    data: {
      userId, amount
    }
   })
   return res
  };

  const deposit = async (userId: string, amount: number, fiatType:number) => {
    const res = await api<XTRInvoice>({
     url: `/api/payments/top-up`,
     method: 'POST',
     data: {
       userId, 
       amount,
       fiatType
     }
    })
    return res.data
   };

  return { withdraw, deposit };
}
