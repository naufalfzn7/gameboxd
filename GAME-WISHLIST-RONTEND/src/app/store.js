import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import authReducer from "../features/authSlice";
import authApi from "../services/authApi";
import usersApi from "../services/usersApi";
import gameApi from "../services/gameApi";
import wishListApi from "../services/wishListApi";
import reviewApi from "../services/reviewApi";
import favoriteApi from "../services/favoriteApi";

const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
    [wishListApi.reducerPath]: wishListApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [favoriteApi.reducerPath]: favoriteApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(gameApi.middleware)
      .concat(wishListApi.middleware)
      .concat(reviewApi.middleware)
      .concat(favoriteApi.middleware),
});

setupListeners(store.dispatch);

export default store;
