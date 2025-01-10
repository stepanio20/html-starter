import { BrowserRouter, Route, Routes } from 'react-router-dom'
import FunGame from '../sections/FunGame'
import Game from '../sections/Game'
import { Home } from '../sections/Home'



const Router = () => {
	return (
		<BrowserRouter>
			<Routes>	
				<Route path='/' element={<Home/>} />
				<Route path='/game' element={<Game/>} />
				<Route path='/fun' element={<FunGame/>} />
			</Routes>
		</BrowserRouter>
	)
}

export default Router