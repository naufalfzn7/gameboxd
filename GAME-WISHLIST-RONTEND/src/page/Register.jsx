import React, { useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRegisterMutation } from "../services/authApi";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { successAlert } from "../utils/Alert";
import LoadingOverlay from "../components/LoadingOverlay";

// Schema validasi Yup
const schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  name: Yup.string().required("Name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
    .matches(/[0-9]/, "Password must contain a number")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[@$!%*?&]/, "Password must contain a special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const [registerUser, { isLoading, isError, error }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const handleRegister = async (data) => {
    const { email, password, name } = data;
    try {
      const result = await registerUser({ email, password, name }).unwrap();
      if (result) {
        successAlert(
          "Email activation has been sent. Please check your inbox.",
        );
      }
    } catch (err) {
      console.error("Registration failed: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <LoadingOverlay
        isLoading={isLoading}
        message="Creating your account..."
      />

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
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 sm:mt-2">
            Join us and start your wishlist
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleRegister)}
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
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm 
              text-neutral-900 placeholder-neutral-400 caret-black
              outline-none focus:border-black focus:ring-1 focus:ring-black transition"
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1 sm:mt-2">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              {...register("name")}
              placeholder="John Doe"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm 
              text-neutral-900 placeholder-neutral-400 caret-black
              outline-none focus:border-black focus:ring-1 focus:ring-black transition"
            />

            {errors.name && (
              <p className="text-red-500 text-xs mt-1 sm:mt-2">
                {errors.name.message}
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
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-xs sm:text-sm 
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-xs sm:text-sm 
                text-neutral-900 placeholder-neutral-400 caret-black
                outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black transition"
              >
                {showConfirmPassword ? (
                  <IoEye size={18} className="sm:w-5 sm:h-5" />
                ) : (
                  <IoEyeOff size={18} className="sm:w-5 sm:h-5" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 sm:mt-2">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:opacity-90 active:scale-95 transition disabled:opacity-70"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          {/* Error API */}
          {isError && (
            <p className="text-red-500 text-xs sm:text-sm text-center">
              {error?.data?.message || "Registration failed"}
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

export default Register;
