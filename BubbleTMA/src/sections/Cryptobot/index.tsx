


export default function Cryptobot() {

	const createInvoice = async () => {
		const apiUrl = "https://pay.crypt.bot/api/createInvoice";
		const apiKey = "328769:AA9fWocxPPDUSmf6Mjm5UfXGCdkCY6v2BwY";
	
		const data = {
			currency_type: "crypto",
			asset: "USDT",
			amount: "10.00",
			description: "Оплата за услуги",
			hidden_message: "Спасибо за оплату!",
			paid_btn_name: "callback",
			paid_btn_url: "https://ваш-сайт.com/success",
			allow_comments: true,
			allow_anonymous: false,
			expires_in: 3600
		};
	
		try {
			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Crypto-Pay-API-Token": apiKey
				},
				body: JSON.stringify(data)
			});
	
			const result = await response.json();
			if (result.ok) {
				console.log("Инвойс создан успешно:", result.result);
			} else {
				console.error("Ошибка при создании инвойса:", result.error);
			}
		} catch (error) {
			console.error("Произошла ошибка при запросе:", error);
		}
	};

	
	return (
		<div>
		 <button onClick={createInvoice}>123</button>
		</div>
	)
}