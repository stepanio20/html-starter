import { configureStore } from '@reduxjs/toolkit'
import playerReducer from '../slices/GameSlide'
import userReducer from '../slices/UserSlide'

const store = configureStore({
  reducer: {
    players: playerReducer, 
    user: userReducer
  },
	devTools: true
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
