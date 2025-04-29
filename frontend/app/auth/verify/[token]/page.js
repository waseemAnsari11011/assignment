"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import "../../register/register.css";

function Verify() {
  const params = useParams();
  const token = params.token;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verify/${token}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "Failed.");
          });
        }
      })
      .then((data) => {
        console.log(data);
        alert("You are verified!");
        window.location = "/auth/login";
      })
      .catch((err) => {});
  }, []);

  console.log(token);

  return <div className="main"></div>;
}

export default Verify;
