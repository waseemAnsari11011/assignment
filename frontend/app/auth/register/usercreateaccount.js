"use client";
import "./imgupload.css";

import { useState } from "react";

function Createaccount() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "user",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (e) => {
    e.preventDefault();
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    document.querySelector(".loaderoverlay").style.display = "flex";

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", formData.userType);

      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/register`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      document.querySelector(".loaderoverlay").style.display = "none";

      if (response.ok) {
        alert(
          "We have sent an email to verify your account. Open your email and click on the link to verify your account."
        );

        //  Reset all form fields after success
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          userType: "user",
        });
        setProfileImage(null);
        setProfileImagePreview(null);

        // Optionally: Reset file input manually if needed
        const fileInput = document.getElementById("imageInput");
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      document.querySelector(".loaderoverlay").style.display = "none";
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="main mymain">
      <div className="left-container">
        <img src="/images/img1.jpg" alt="Profile" className="profile-pic" />
      </div>
      <div className="right-container">
        <form className="form" onSubmit={handleSubmit}>
          <h1>Create Account</h1>

          <div className="form-tab">
            <label>Enter Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Your Name"
              required
            />
          </div>

          <div className="form-tab">
            <label>Enter Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="@gmail.com"
              required
            />
          </div>

          <div className="form-tab">
            <label>Enter Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
            />
          </div>

          <div className="form-tab">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              required
            />
          </div>

          <div className="radio-btn form-tab">
            <div className="radio-ret">
              <input
                type="radio"
                name="userType"
                value="user"
                checked={formData.userType === "user"}
                onChange={handleChange}
              />
              <label>User</label>
            </div>
            <div className="radio-self">
              <input
                type="radio"
                name="userType"
                value="admin"
                checked={formData.userType === "admin"}
                onChange={handleChange}
              />
              <label>Admin</label>
            </div>
          </div>

          <div className="image-uploader" style={{ marginBottom: "50px" }}>
            <div className="add-image">
              <input
                type="file"
                id="imageInput"
                onChange={handleImageUpload}
                accept="image/*"
              />
              <label htmlFor="imageInput" className="add-image-label">
                <p>Add Profile Image</p>
              </label>
            </div>

            {profileImagePreview && (
              <div className="image-preview">
                <div className="image-container">
                  <img src={profileImagePreview} alt="Profile Preview" />
                  <button className="remove-button" onClick={removeImage}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="form-tab">
            Create Account ➜
          </button>
        </form>
      </div>
    </div>
  );
}

export default Createaccount;
