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
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <LoadingOverlay isLoading={isLoading} message="Logging you in..." />

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-neutral-200 p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-5 flex justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-black flex items-center justify-center">
              <span className="text-white font-semibold text-base sm:text-lg">
                W
              </span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">
            Sign in to your account
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 sm:mt-2">
            Enter your credentials to continue
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleLogin)}
          className="space-y-4 sm:space-y-5 md:space-y-6"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-sm 
             text-neutral-900 placeholder-neutral-400 caret-black
             outline-none focus:border-black focus:ring-1 focus:ring-black transition"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 sm:mt-2">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-base sm:text-sm 
             text-neutral-900 placeholder-neutral-400 caret-black
             outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black transition"
              >
                {showPassword ? (
                  <IoEye size={18} className="sm:w-5 sm:h-5" />
                ) : (
                  <IoEyeOff size={18} className="sm:w-5 sm:h-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1 sm:mt-2">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:opacity-90 active:scale-95 transition disabled:opacity-70"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {/* Error */}
          {isError && (
            <p className="text-red-500 text-xs sm:text-sm text-center">
              {error?.data?.message || "Login failed"}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs text-neutral-400">
          © 2026 Gamebox'd
        </div>
      </div>
    </div>
  );
};

export default Login;
