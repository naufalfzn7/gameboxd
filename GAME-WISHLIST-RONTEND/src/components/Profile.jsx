import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoEyeOff, IoEye } from "react-icons/io5";

import { useMeQuery, useUpdateMeMutation } from "../services/usersApi";
import { setUser } from "../features/authSlice";
import { successAlert, errorAlert } from "../utils/Alert";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .test(
      "password-length",
      "Password must be at least 6 characters",
      (value) => !value || value.length >= 6
    ),
  confirmPassword: Yup.string().test(
    "match",
    "Passwords must match",
    (value, ctx) => {
      if (ctx.parent.password) return value === ctx.parent.password;
      return true;
    }
  ),
});

const Profile = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { data: meData, isLoading, isError, refetch } = useMeQuery();
  const [updateMe, { isLoading: isUpdating, error: updateError }] =
    useUpdateMeMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (meData?.data) {
      reset({
        name: meData.data.name || "",
        email: meData.data.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [meData, reset]);

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
    };

    if (values.password) {
      payload.password = values.password;
    }

    try {
      const result = await updateMe(payload).unwrap();
      const updatedUser = result?.data || meData?.data || payload;
      dispatch(setUser({ user: updatedUser }));
      await refetch();
      await successAlert(result?.message || "Profile updated successfully.");
      reset({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      await errorAlert(err?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (isError || !meData?.data) {
    return <div className="p-6 text-red-600">Failed to load profile data.</div>;
  }

  const user = meData.data;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Account Info</h2>
        <p className="text-sm text-base-content/70 mb-4">
          Update your profile details. Leave the password blank if you do not
          want to change it.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded border border-base-200 p-3">
            <p className="text-base-content/60">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div className="rounded border border-base-200 p-3">
            <p className="text-base-content/60">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div className="rounded border border-base-200 p-3">
            <p className="text-base-content/60">Role</p>
            <p className="font-medium">{user.role}</p>
          </div>
          <div className="rounded border border-base-200 p-3">
            <p className="text-base-content/60">Status</p>
            <p className="font-medium">
              {user.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Your name"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-12"
                  placeholder="Leave blank to keep current password"
                  {...register("password")}
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
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-12"
                  placeholder="Repeat new password"
                  {...register("confirmPassword")}
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
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {updateError?.data?.message && (
            <p className="text-sm text-red-500">{updateError.data.message}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                reset({
                  name: user.name || "",
                  email: user.email || "",
                  password: "",
                  confirmPassword: "",
                })
              }
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
