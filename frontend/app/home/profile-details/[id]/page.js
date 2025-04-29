"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // for getting URL params
import { useAxios } from "@/app/api/useAxios";
import { useRouter } from "next/navigation";

const ProfileDetailsPage = () => {
  const router = useRouter();
  const axios = useAxios();
  const { id } = useParams(); // get the dynamic route param
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
    } else {
      // If no user found, redirect to login
      router.replace("/auth/login");
    }
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${userId}`);
      setUser(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user details");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetails(id);
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <div>
      <h1>Profile Details</h1>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {/* Add more fields if you want */}
    </div>
  );
};

export default ProfileDetailsPage;
