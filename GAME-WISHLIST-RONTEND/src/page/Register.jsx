import React, { useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRegisterMutation } from "../services/authApi";
import { IoEyeOff, IoEye } from "react-icons/io5";
import Swal from "sweetalert2";
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
  // Setup React Hook Form dengan mode "onChange" untuk validasi realtime
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange", // Validasi realtime saat input berubah
  });

  // Fungsi submit
  const handleRegister = async (data) => {
    const { email, password, name } = data;
    try {
      const result = await registerUser({ email, password, name }).unwrap();
      if (result)
        successAlert(
          "Email activation has been sent. Please check your inbox.",
        );
    } catch (err) {
      console.error("Registration failed: ", err);
      alert("Registration failed: " + (err?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <LoadingOverlay
        isLoading={isLoading}
        message="Creating your account..."
      />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 space-y-6">
        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Get started
          </p>
          <h1 className="text-3xl font-semibold text-black">Create Account</h1>
          <p className="text-sm text-gray-600">
            Join us and start your wishlist.
          </p>
        </header>
        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
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

          {/* Name */}
          <div className="form-control">
            <label className="label" htmlFor="name">
              <span className="label-text text-black">Name</span>
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="input input-bordered input-lg w-full"
              placeholder="John Doe"
            />
            {errors.name && (
              <span className="text-error text-sm mt-1">
                {errors.name.message}
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

          {/* Confirm Password */}
          <div className="form-control">
            <label className="label" htmlFor="confirmPassword">
              <span className="label-text text-black">Confirm Password</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="input input-bordered input-lg w-full pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showConfirmPassword ? (
                  <IoEye size={20} />
                ) : (
                  <IoEyeOff size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-error text-sm mt-1">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full font-semibold active:scale-110 active:bg-cyan-500 transition-transform focus:outline-none focus:ring-4 focus:ring-cyan-300 mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          {/* Error dari API */}
          {isError && (
            <p className="text-error text-sm text-center">
              {error?.data?.message || "Registration failed"}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
