import { useMutation } from "@tanstack/react-query";
import { shopCategories } from "@/utils/categories";
import axios, { AxiosError } from "axios";
import React from "react";
import { useForm } from "react-hook-form";

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const bioValue = watch("bio", "");
  const wordCount = bioValue ? bioValue.trim().split(/\s+/).length : 0;

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URl}/api/create-shop`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  return (
    <div className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
      <div className='bg-gradient-to-r from-[#0066CC] to-[#0047AB] p-6 text-center'>
        <h1 className='text-2xl font-bold text-white'>Setup Your Shop</h1>
        <p className='text-blue-100 mt-2'>Complete your seller profile</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name *
            </label>
            <input
              type="text"
              placeholder="Enter your shop name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              {...register("name", {
                required: "Shop name is required",
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Shop Bio (Max 100 words) *
              </label>
              <span className={`text-xs ${wordCount > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                {wordCount}/100 words
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Describe your shop in a few words"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              {...register("bio", {
                required: "Bio is required",
                validate: (value) => {
                  const words = value.trim().split(/\s+/);
                  return words.length <= 100 || "Bio can't exceed 100 words";
                },
              })}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{String(errors.bio.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Address *
            </label>
            <input
              type="text"
              placeholder="Enter your shop address"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              {...register("address", {
                required: "Shop address is required",
              })}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.address.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opening Hours *
            </label>
            <input
              type="text"
              placeholder="e.g., Mon-Fri 9AM - 6PM"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              {...register("opening_hours", {
                required: "Opening hours are required",
              })}
            />
            {errors.opening_hours && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.opening_hours.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              {...register("website", {
                pattern: {
                  value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
                  message: "Enter a valid URL",
                },
              })}
            />
            {errors.website && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.website.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              {...register("category", { required: "Category is required" })}
            >
              <option value="">Select a category</option>
              {shopCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.category.message)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={shopCreateMutation.isPending}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#0066CC] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center"
          >
            {shopCreateMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Shop...
              </>
            ) : 'Create Shop'}
          </button>

          {shopCreateMutation.isError && shopCreateMutation.error instanceof AxiosError && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {shopCreateMutation.error.response?.data?.message || "An error occurred while creating your shop"}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateShop;