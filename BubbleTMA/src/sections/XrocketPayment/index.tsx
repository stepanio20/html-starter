
// Интерфейс для структуры ответа инвойса
interface InvoiceResponse {
    success: boolean;
    data: {
        id: string;
        amount: null;
        minPayment: number;
        currency: string;
        description: string;
        hiddenMessage: string;
        commentsEnabled: number;
        payload: string;
        callbackUrl: string;
        status: string;
        expiredIn: number;
        link: string;
        activationsLeft: null;
        totalActivations: null;
    };
}

export default function XRocketPayment() {
    const openInvoice = (link: string) => {
        window.open(link, "_blank");
    };
		const sendInvoiceRequest = async () => {
			const data = { 
				amount: 0, 
				minPayment: 0.5, 
				numPayments: 0, 
				currency: "USDT", 
				description: "best thing in the world, 1 item", 
				hiddenMessage: "thank you", 
				commentsEnabled: false, 
				callbackUrl: "https://t.me/ton_rocket", 
				payload: "some custom payload I want to see in webhook or when I request invoice", 
				expiredIn: 100, 
				receivingAddress: "UQAT3S5Z2A81Vn8XPrOIXAuCQerScxBI2cH8jBXfaEdD2-BD" 

			};
		
			try {
				const response = await fetch('http://localhost:8000/send-invoice', {
					method: 'POST',
					body: JSON.stringify(data)
				});
		
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
		
				const result = await response.json();
				console.log('Ответ:', result);
			} catch (error) {
				console.error('Ошибка:', error);
			}
		};
	

    return (
        <div>
            <button onClick={sendInvoiceRequest}>Открыть инвойс</button>
        </div>
    );
}