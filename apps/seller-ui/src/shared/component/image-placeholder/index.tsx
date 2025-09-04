import React, { useState } from "react";

const ImagePlaceHolder = ({
  small,
  size,
  defaultImage = null,
  index = 0,
  setValue,
  images,
  setImages,
}: {
  size: string;
  small?: boolean;
  defaultImage?: string | null;
  index?: number;
  setValue: any;
  images: any;
  setImages: any;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      const updated = [...images];
      updated[index] = { base64, file };

      // Push one more empty slot if this is the last image
      if (index === images.length - 1) {
        updated.push(null);
      }

      setImagePreview(base64); // ✅ set the preview
      setImages(updated);
      setValue("images", updated); // for react-hook-form
    };

    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`}
    >
      <label
        htmlFor={`image-upload-${index}`}
        className="w-full h-full flex flex-col justify-center items-center cursor-pointer"
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <>
            <p
              className={`text-gray-400 ${
                small ? "text-xl" : "text-4xl"
              } font-semibold`}
            >
              {size}
            </p>
            <p
              className={`text-gray-500 ${
                small ? "text-sm" : "text-lg"
              } pt-2 text-center`}
            >
              Please choose an image <br />
              according to the expected ratio
            </p>
          </>
        )}
      </label>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleImageChange}
      />
    </div>
  );
};

export default ImagePlaceHolder;