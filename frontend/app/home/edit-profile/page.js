"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAxios } from "@/app/api/useAxios";

const EditProfilePage = () => {
  const axios = useAxios();
  const router = useRouter();

  const [profileImage, setProfileImage] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
    } else {
      // If no user found, redirect to login
      router.replace("/auth/login");
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setValue("name", user.name || "");
      setCurrentProfileImage(user.profileImage || "");
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      setLoading(true);
      const response = await axios.patch("/api/users/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      const updatedUser = response.data.user;

      // Update localStorage with the new user data
      const existingUser = JSON.parse(localStorage.getItem("currentUser"));
      const newUser = {
        ...existingUser,
        name: updatedUser.name,
        profileImage: updatedUser.profileImage,
      };
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      alert("Profile updated successfully!");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const nameValue = watch("name");

  return (
    <div>
      <h1>Edit Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: "400px" }}>
        {/* Name Field */}
        <div style={{ marginBottom: "20px" }}>
          <label>Name:</label>
          <input
            type="text"
            {...register("name", {
              required: "Name is required",
              pattern: {
                value: /^[A-Za-z\s]+$/, // Only alphabets and spaces
                message: "Name can only contain alphabets and spaces",
              },
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
            }}
          />
          <small style={{ color: "#666" }}>
            Only alphabets are allowed, no numbers or special characters.
          </small>
          {errors.name && (
            <p style={{ color: "red", marginTop: "5px" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Current Profile Image */}
        <div style={{ marginBottom: "20px" }}>
          <label>Current Profile Image:</label>
          {currentProfileImage ? (
            <div style={{ marginTop: "10px" }}>
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${currentProfileImage}`}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
          ) : (
            <p>No profile image uploaded.</p>
          )}
        </div>

        {/* New Profile Image */}
        <div style={{ marginBottom: "20px" }}>
          <label>New Profile Image (optional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
