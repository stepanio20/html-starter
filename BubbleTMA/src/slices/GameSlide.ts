import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Player {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface PlayerState {
  players: Player[];
}

const initialState: PlayerState = {
  players: [],
};

const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    setPlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
    },
    updatePlayer: (state, action: PayloadAction<Player>) => {
      const existingPlayer = state.players.find(player => player.id === action.payload.id);
      if (existingPlayer) {
        existingPlayer.x = action.payload.x;
        existingPlayer.y = action.payload.y;
        existingPlayer.size = action.payload.size;
        existingPlayer.color = action.payload.color || existingPlayer.color;
      } else {
        state.players.push(action.payload);
      }
    },
  },
});
export const getPlayers = (state: { players: PlayerState }) => state.players.players;
export const { setPlayers, updatePlayer } = playerSlice.actions;
export default playerSlice.reducer;
