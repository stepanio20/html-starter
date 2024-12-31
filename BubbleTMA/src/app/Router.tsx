import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Game from '../sections/Game'
import { Home } from '../sections/Home'



const Router = () => {
	return (
		<BrowserRouter>
			<Routes>	
				<Route path='/' element={<Home/>} />
				<Route path='/game' element={<Game/>} />
			</Routes>
		</BrowserRouter>
	)
}

export default Router