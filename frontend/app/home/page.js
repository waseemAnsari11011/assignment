"use client";

import React, { useEffect, useState } from "react";
import { useAxios } from "../api/useAxios"; // update import path
import Link from "next/link";
import { useRouter } from "next/navigation";

const Page = () => {
  const axios = useAxios();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null); // instead of context
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  console.log("currentUse====>>>>", currentUser);

  // Fetch current logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      // If no user found, redirect to login
      router.replace("/auth/login");
    }
  }, []);

  const fetchUsers = async (searchQuery = "", pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users", {
        params: { search: searchQuery, page: pageNumber, limit: 10 },
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search, page);
  }, [page, currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, 1);
  };

  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/api/users/${userId}`, { withCredentials: true });
      fetchUsers(search, page);
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>All Users</h1>
        <Link href="/home/edit-profile">
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Edit Profile
          </button>
        </Link>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search users by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "8px 12px" }}>
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div>
          <ul>
            {users.map((u) => (
              <li key={u.id} style={{ marginBottom: "10px" }}>
                <Link href={`/profile-details/${u.id}`}>
                  {u.name} ({u.email})
                </Link>

                {/* Only show Delete button if current user is admin and not deleting self */}
                {currentUser?.role === "admin" && currentUser.id !== u.id && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    style={{
                      marginLeft: "10px",
                      padding: "5px 10px",
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              style={{ padding: "8px 12px", marginRight: "10px" }}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              style={{ padding: "8px 12px", marginLeft: "10px" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
