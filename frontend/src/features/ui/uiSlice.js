import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFormDirty: false,
  pendingNavigationPath: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setFormDirty: (state, action) => {
      state.isFormDirty = action.payload;
    },
    setPendingNavigation: (state, action) => {
      state.pendingNavigationPath = action.payload;
    },
    clearNavigation: (state) => {
      state.pendingNavigationPath = null;
    },
  },
});

export const { setFormDirty, setPendingNavigation, clearNavigation } = uiSlice.actions;
export default uiSlice.reducer;
