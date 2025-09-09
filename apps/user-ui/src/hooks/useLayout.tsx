import axiosInstance from "../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

// fetch layout data from API
const fetchLayout = async () => {
  const response = await axiosInstance.get("/auth/api/get-layouts");
  return response.data.layout;
};

const useLayout = () => {
  const {
    data: layout,
    isPending: isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["layout"],
    queryFn: fetchLayout,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  return {
    layout,
    isLoading,
    isError,
    refetch,
  };
};

export default useLayout;