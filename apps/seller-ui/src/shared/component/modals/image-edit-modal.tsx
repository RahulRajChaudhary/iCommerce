"use client";

import React, { useState } from "react";
import { X, UploadCloud, Wand, Trash2, Loader } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { convertFileToBase64 } from "@/utils/convertToBase64";

interface ImageEditModalProps {
  editType: "cover" | "avatar";
  onClose: () => void;
}

const enhancements = [
  { label: "Remove BG", effect: "e-removedotbg" },
  { label: "Drop Shadow", effect: "e-dropshadow" },
  { label: "Retouch", effect: "e-retouch" },
  { label: "Upscale", effect: "e-upscale" },
];

const updateProfilePicture = async ({
  editType,
  imageUrl,
}: {
  editType: "cover" | "avatar";
  imageUrl: string;
}) => {
  if (!editType || !imageUrl) throw new Error("Missing required fields!");

  const response = await axiosInstance.put("/seller/api/update-image", {
    editType,
    imageUrl,
  });

  return response.data;
};

const ImageEditModal = ({ editType, onClose }: ImageEditModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Handle File Upload
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Automatically upload the image to ImageKit
      await uploadToImageKit(file);
    }
  };

  // Upload Image to ImageKit
  const uploadToImageKit = async (file: File) => {
    setUploading(true);
    try {
      const base64Image = await convertFileToBase64(file);
      const payload = {
        file: base64Image,
        fileName: file.name,
        folder: editType === "cover" ? "cover" : "avatar",
      };

      const response = await axiosInstance.post(
        "/seller/api/upload-image",
        payload
      );

      if (response.data.url) {
        setImageUrl(response.data.url);
      }
    } catch (error) {
      console.error("Upload Failed:", error);
    } finally {
      setUploading(false);
    }
  };

  // Apply AI Transformation
  const applyTransformation = async (transformation: string) => {
    if (!imageUrl || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const transformedUrl = `${imageUrl}?tr=${transformation}`;
      setPreviewUrl(transformedUrl);
    } catch (error) {
      console.error("Transformation Failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const { mutate: updatePicture } = useMutation({
    mutationFn: updateProfilePicture,
    onSuccess: (data) => {
      toast.success(data.message || "Profile updated successfully!");

      queryClient.invalidateQueries({ queryKey: ["seller"] });

      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update profile!"
      );
    },
  });

  const handleUpdate = () => {
    if (!imageUrl) return;
    updatePicture({ editType, imageUrl });
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 mb-4">
          <h2 className="text-lg font-semibold">
            {editType === "cover" ? "Edit Cover Photo" : "Edit Profile Picture"}
          </h2>
          <X size={20} className="cursor-pointer" onClick={onClose} />
        </div>

        {/* Upload Section */}
        {!previewUrl ? (
          <label className="flex flex-col items-center gap-2 p-6 border border-gray-600 rounded-md cursor-pointer hover:bg-gray-700 h-[220px] justify-center">
            {uploading ? (
              <Loader size={30} className="animate-spin text-gray-400" />
            ) : (
              <>
                <UploadCloud size={30} />
                <p className="text-gray-400">Click to upload</p>
              </>
            )}
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        ) : (
          <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
            {uploading ? (
              <div className="flex items-center justify-center h-full">
                <Loader size={30} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <Image
                src={previewUrl}
                alt="Preview"
                layout="fill"
                objectFit="contain"
              />
            )}
          </div>
        )}

        {/* Editing Options */}
        {imageUrl && (
          <div className="mt-4 space-y-2">
            <h3 className="text-white text-sm font-semibold">
              AI Enhancements
            </h3>
            <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
              {enhancements.map(({ label, effect }) => (
                <button
                  key={effect}
                  className={`p-2 rounded-md flex items-center gap-2 ${
                    activeEffect === effect
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => applyTransformation(effect)}
                  disabled={processing}
                >
                  {processing && activeEffect === effect ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Wand size={18} />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-5">
          <button
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
              setImageUrl(null);
              setActiveEffect(null);
            }}
          >
            <Trash2 size={18} /> Reset
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpdate}
            disabled={!imageUrl || processing}
          >
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;