import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { useMeQuery } from "../services/usersApi";
import { setUser } from "../features/authSlice";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = useSelector((state) => state.auth.token);
  const { data, isLoading, isError, isSuccess } = useMeQuery(undefined, {
    skip: !token, // skip the query if there's no token
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser({ user: data.data }));
    }
  }, [isSuccess, data, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace state={{ reason: "auth-required" }} />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    return <Navigate to="/login" replace state={{ reason: "auth-required" }} />;
  }

  if (allowedRoles && !allowedRoles.includes(data.data.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
