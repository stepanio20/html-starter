import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Player {
  id: string;
  x: number;
  y: number;
  size: number;
  value: number;
  color: string;
}

interface PlayerState {
  players: Player[];
  playerId: string;
  ping: number
}

const initialState: PlayerState = {
  players: [],
  playerId: '',
  ping: 0
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
        existingPlayer.value = action.payload.value;
        existingPlayer.color = action.payload.color || existingPlayer.color;
      } else {
        state.players.push(action.payload);
      }
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(player => player.id !== action.payload.trim());
    },
    setPlayerId: (state, action: PayloadAction<string>) => {
      if (action.payload.length !== 0) {
        state.playerId = action.payload
      }
    },
    setPing: (state, action: PayloadAction<number>) => {
      if (action.payload as number) {
        state.ping = action.payload
      }
    },
  },
});

export const getPlayers = (state: { players: PlayerState }) => state.players.players;
export const { setPlayers, updatePlayer, removePlayer, setPlayerId, setPing} = playerSlice.actions;
export default playerSlice.reducer;
