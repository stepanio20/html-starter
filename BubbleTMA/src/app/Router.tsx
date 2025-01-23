import { BrowserRouter, Route, Routes } from 'react-router-dom'
import FunGame from '../sections/FunGame'
import Game from '../sections/Game'
import { Home } from '../sections/Home'
import XRocketPayment from '../sections/XrocketPayment'



const Router = () => {
	return (
		<BrowserRouter>
			<Routes>	
				<Route path='/' element={<Home/>} />
				<Route path='/game' element={<Game/>} />
				<Route path='/fun' element={<FunGame/>} />
				<Route path='/xrocket' element={<XRocketPayment/>} />
			</Routes>
		</BrowserRouter>
	)
}

export default Router