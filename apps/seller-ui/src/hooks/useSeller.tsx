"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import React from "react";
import { isProtected } from "../utils/protected";

// fetch seller data from API
const fetchSeller = async () => {
  const response = await axiosInstance.get(
    "/api/logged-in-seller",
    isProtected
  );
  return response.data.seller;
};

const useSeller = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  const {
    data: seller,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: isLoggedIn, // Only run query if seller should be logged in
  });

  // Update auth state based on query results
  React.useEffect(() => {
    if (seller) {
      setLoggedIn(true);
    } else if (isError) {
      setLoggedIn(false);
    }
  }, [seller, isError, setLoggedIn]);

  return { seller: seller as any, isLoading: isPending, isError };
};

export default useSeller;