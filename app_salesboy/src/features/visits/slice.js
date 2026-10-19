import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  offlineQueue: []
};

export const visitSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    queueOfflineVisit: (state, action) => {
      state.offlineQueue.push(action.payload);
    },
    removeQueuedVisit: (state, action) => {
      state.offlineQueue = state.offlineQueue.filter(
        (v) => v.client_uuid !== action.payload
      );
    },
    clearOfflineQueue: (state) => {
      state.offlineQueue = [];
    }
  }
});

export const { queueOfflineVisit, removeQueuedVisit, clearOfflineQueue } = visitSlice.actions;
export default visitSlice.reducer;
