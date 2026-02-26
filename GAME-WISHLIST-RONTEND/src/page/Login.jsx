import React, { useState } from "react";
import { useLoginMutation } from "../services/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IoEyeOff, IoEye } from "react-icons/io5";
import Swal from "sweetalert2";
import { successAlert } from "../utils/Alert";
import LoadingOverlay from "../components/LoadingOverlay";

// Schema validasi Yup
const schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [login, { isLoading, isError, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const handleLogin = async (data) => {
    const { email, password } = data;
    try {
      const result = await login({ email, password }).unwrap();
      console.log(result);

      dispatch(setCredentials({ token: result.token }));
      navigate("/dashboard");
      successAlert("Login Successful. You have been logged in.");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <LoadingOverlay
        isLoading={isLoading}
        message="Logging you in..."
      />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 space-y-6">
        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold text-black">Sign in</h1>
          <p className="text-sm text-gray-600">
            Access your wishlist and keep exploring.
          </p>
        </header>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          {/* Email */}
          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text text-black">Email</span>
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="input input-bordered input-lg w-full"
              placeholder="you@example.com"
            />
            {errors.email && (
              <span className="text-error text-sm mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label" htmlFor="password">
              <span className="label-text text-black">Password</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="input input-bordered input-lg w-full pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-error text-sm mt-1">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full font-semibold active:scale-110 active:bg-cyan-500 transition-transform focus:outline-none focus:ring-4 focus:ring-cyan-300 mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {isError && (
            <p className="text-error text-sm text-center">
              {error?.data?.message || "Login failed"}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
