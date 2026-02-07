import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { useMeQuery } from "../services/usersApi";
import { setUser } from "../features/authSlice";

const PublicRoute = () => {
  const { token } = useSelector((state) => state.auth);
  const { data, isLoading } = useMeQuery(undefined, {
    skip: !token, // skip the query if there's no token
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && data) {
      // if authenticated, set user and redirect to dashboard
      dispatch(setUser({ user: data.data }));
      navigate("/dashboard");
    }
  }, [token, data, dispatch, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (token && data) {
    return <div>Redirecting...</div>; // guarded by effect above
  }

  return <Outlet />; // render children routes
};

export default PublicRoute;
