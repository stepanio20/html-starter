import { configureStore } from '@reduxjs/toolkit'
import playerReducer from '../slices/GameSlide'

const store = configureStore({
  reducer: {
    players: playerReducer, 
  },
	devTools: true
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
