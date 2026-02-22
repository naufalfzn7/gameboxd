import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoEyeOff, IoEye } from "react-icons/io5";

import { useMeQuery, useUpdateMeMutation } from "../services/usersApi";
import { useGetWishListQuery } from "../services/wishListApi";
import { useGetMyReviewsQuery } from "../services/reviewApi";
import {
  useGetFavoritesQuery,
  useUpdateFavoritesMutation,
} from "../services/favoriteApi";
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
      (value) => !value || value.length >= 6,
    ),
  confirmPassword: Yup.string().test(
    "match",
    "Passwords must match",
    (value, ctx) => {
      if (ctx.parent.password) return value === ctx.parent.password;
      return true;
    },
  ),
});

const Profile = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const { data: meData, isLoading, isError, refetch } = useMeQuery();
  const { data: wishlistData } = useGetWishListQuery();
  const { data: reviewsData } = useGetMyReviewsQuery();
  const { data: favoritesData } = useGetFavoritesQuery();
  const [updateFavorites, { isLoading: isSavingFavorites }] =
    useUpdateFavoritesMutation();
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

  useEffect(() => {
    const ids = (favoritesData?.data || [])
      .map((fav) => fav.gameId)
      .filter((id) => Number.isInteger(id));
    setSelectedFavorites(ids);
  }, [favoritesData]);

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
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg border border-gray-700">
            <p className="text-lg opacity-90">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !meData?.data) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-md">
            <p className="text-lg text-red-600">Failed to load profile data.</p>
          </div>
        </div>
      </div>
    );
  }

  const user = meData.data;
  const wishlistCount = wishlistData?.data?.length || 0;
  const reviewsCount = reviewsData?.data?.length || 0;
  const favorites = favoritesData?.data || [];
  const wishlistGames = (wishlistData?.data || [])
    .map((item) => item.game)
    .filter(Boolean);
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";
  const favoriteSlots = [...favorites];
  while (favoriteSlots.length < 4) {
    favoriteSlots.push(null);
  }

  const handleToggleFavorite = (gameId) => {
    setSelectedFavorites((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter((id) => id !== gameId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, gameId];
    });
  };

  const handleSaveFavorites = async () => {
    try {
      await updateFavorites(selectedFavorites).unwrap();
      setIsFavoritesOpen(false);
      await successAlert("Favorites updated.");
    } catch (err) {
      await errorAlert(err?.data?.message || "Failed to update favorites.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
          <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl border border-gray-700">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-300">
                  Profile
                </p>
                <h1 className="text-4xl font-extrabold mt-2">
                  {user.name || "Player One"}
                </h1>
                <p className="text-gray-300 mt-2 max-w-xl">
                  Curate your taste. Build your signature shelf and track the
                  games you love.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-white/10 px-4 py-2 text-sm border border-white/20">
                  {user.role}
                </div>
                <div className="rounded-full bg-white/10 px-4 py-2 text-sm border border-white/20">
                  {user.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-300">
                  Email
                </p>
                <p className="mt-2 font-semibold break-all">{user.email}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-300">
                  Member Since
                </p>
                <p className="mt-2 font-semibold">{memberSince}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-300">
                  Reviews
                </p>
                <p className="mt-2 font-semibold">{reviewsCount}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-300">
                  Wishlist
                </p>
                <p className="mt-2 font-semibold">{wishlistCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Favorite Four
              </h2>
              <span className="text-sm text-gray-500">Placeholder</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your signature lineup. Inspired by Letterboxd-style shelves.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {favoriteSlots.map((favorite, index) => (
                <div
                  key={favorite?.id || index}
                  className="aspect-[3/4] rounded-xl border border-dashed border-gray-300 bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400"
                >
                  {favorite?.game ? (
                    <img
                      src={favorite.game.urlPicture || "/images/game.jpg"}
                      alt={favorite.game.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs uppercase tracking-[0.3em]">
                      Slot {index + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                onClick={() => setIsFavoritesOpen(true)}
              >
                Add Favorites
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Edit Profile
            </h2>
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
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
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
                      {showPassword ? (
                        <IoEye size={20} />
                      ) : (
                        <IoEyeOff size={20} />
                      )}
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                <p className="text-sm text-red-500">
                  {updateError.data.message}
                </p>
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
      </div>

      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Select Favorite Four
                  </h3>
                  <p className="text-sm text-gray-500">
                    Choose up to 4 games from your wishlist.
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {selectedFavorites.length}/4 selected
                </span>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {wishlistGames.length === 0 ? (
                <p className="text-sm text-gray-500">Your wishlist is empty.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {wishlistGames.map((game) => {
                    const isSelected = selectedFavorites.includes(game.id);
                    const disableSelect =
                      !isSelected && selectedFavorites.length >= 4;
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => handleToggleFavorite(game.id)}
                        disabled={disableSelect}
                        className={`flex items-center gap-4 rounded-xl border p-3 text-left transition-colors ${
                          isSelected
                            ? "border-gray-900 bg-gray-100"
                            : "border-gray-200 hover:bg-gray-50"
                        } ${disableSelect ? "opacity-50" : ""}`}
                      >
                        <img
                          src={game.urlPicture || "/images/game.jpg"}
                          alt={game.title}
                          className="h-20 w-14 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {game.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {game.genre?.[0] || "Unknown genre"}
                          </p>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border-2 ${
                            isSelected
                              ? "border-gray-900 bg-gray-900"
                              : "border-gray-300"
                          }`}
                        ></div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 p-6">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsFavoritesOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                onClick={handleSaveFavorites}
                disabled={isSavingFavorites}
              >
                {isSavingFavorites ? "Saving..." : "Save Favorites"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
