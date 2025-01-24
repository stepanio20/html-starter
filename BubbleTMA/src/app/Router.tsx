import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Cryptobot from '../sections/Cryptobot'
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
				<Route path='/bot' element={<Cryptobot/>} />
			</Routes>
		</BrowserRouter>
	)
}

export default Router