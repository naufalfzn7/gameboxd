import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import authReducer from "../features/authSlice";
import authApi from "../services/authApi";
import usersApi from "../services/usersApi";
import gameApi from "../services/gameApi";
import wishListApi from "../services/wishListApi";

const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
    [wishListApi.reducerPath]: wishListApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(gameApi.middleware)
      .concat(wishListApi.middleware),
});

setupListeners(store.dispatch);

export default store;
