import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PlayerState {
  userId: string,
  playerId: string,
  balance: number,
  demoBalance: number,
  depositAddress: string
}

const initialState: PlayerState = {
  userId: '',
  playerId: '',
  balance: 0,
  demoBalance: 0,
  depositAddress: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPlayerId: (state, action: PayloadAction<string>) => {
      if (action.payload.length !== 0) {
        state.playerId = action.payload
      }
    },
    setUserId: (state, action: PayloadAction<string>) => {
      if (action.payload.length !== 0) {
        state.userId = action.payload
      }
    },
    setBalance: (state, action: PayloadAction<number>) => {
        state.balance = action.payload
    },
    setDepositAddress: (state, action: PayloadAction<string>) => {
        state.depositAddress = action.payload
    },
    setDemoBalance: (state, action: PayloadAction<number>) => {
      state.demoBalance = action.payload
    },
  },
});

export const { setPlayerId, setUserId, setBalance, setDepositAddress, setDemoBalance} = userSlice.actions;
export default userSlice.reducer;
