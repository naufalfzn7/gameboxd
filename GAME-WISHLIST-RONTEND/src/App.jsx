import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./page/Login";
import Home from "./page/Home";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./page/Register";
import Admin from "./page/Admin";
import Unauthorized from "./page/Unauthorized";
import Sidebar from "./components/SidebarPublic";
import SidebarPublic from "./components/SidebarPublic";
import LandingPage from "./page/LandingPage";
import SidebarUser from "./components/SidebarUser";
import Profile from "./components/Profile";
import GameList from "./page/GameList";
import GameDetail from "./page/GameDetail";
import Wishlist from "./page/Wishlist";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nested routes will render inside Sidebar */}

        <Route element={<PublicRoute />}>
          <Route element={<SidebarPublic />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        <Route path="/" element={<LandingPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<SidebarUser />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/gamelist" element={<GameList />} />
            <Route path="/gamelist/:gameId" element={<GameDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
