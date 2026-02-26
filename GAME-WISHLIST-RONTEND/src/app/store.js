import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../features/authSlice";
import authApi from "../services/authApi";
import usersApi from "../services/usersApi";
import gameApi from "../services/gameApi";
import wishListApi from "../services/wishListApi";
import reviewApi from "../services/reviewApi";
import favoriteApi from "../services/favoriteApi";

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
  blacklist: [
    authApi.reducerPath,
    usersApi.reducerPath,
    gameApi.reducerPath,
    wishListApi.reducerPath,
    reviewApi.reducerPath,
    favoriteApi.reducerPath,
  ], // Don't persist API caches in localStorage (use RTK Query cache instead)
};

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [gameApi.reducerPath]: gameApi.reducer,
  [wishListApi.reducerPath]: wishListApi.reducer,
  [reviewApi.reducerPath]: reviewApi.reducer,
  [favoriteApi.reducerPath]: favoriteApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    })
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(gameApi.middleware)
      .concat(wishListApi.middleware)
      .concat(reviewApi.middleware)
      .concat(favoriteApi.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
export default store;
