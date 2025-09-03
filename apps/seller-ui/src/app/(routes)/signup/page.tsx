'use client'
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { VscEyeClosed, VscEye } from 'react-icons/vsc'
import axios, { AxiosError } from 'axios'
import { countries } from '@/utils/countires';
import CreateShop from '@/shared/modules/auth/create-shop';
import StripeLogo from '@/assets/svgs/stripe-logo';

const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [sellerId, setSellerId] = useState("");

  const [stripeAccountId, setStripeAccountId] = useState("");
  const [showManualStripeInput, setShowManualStripeInput] = useState(false);
  const [stripeConnectionStatus, setStripeConnectionStatus] = useState("");

  const inputRefs = useRef<HTMLInputElement[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  // Add these functions
  const connectStripe = async () => {
    try {
      setStripeConnectionStatus("connecting");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`,
        { sellerId }
      );

      if (response.data.manualSetupRequired) {
        setShowManualStripeInput(true);
        setStripeConnectionStatus("");
      } else if (response.data.alreadyConnected) {
        setStripeConnectionStatus("connected");
        setTimeout(() => {
          router.push('/success');
        }, 2000);
      } else if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Stripe Connection Error:", error);
      setStripeConnectionStatus("error");
    }
  };

  const submitStripeAccountId = async () => {
    try {
      setStripeConnectionStatus("connecting");

      // Clean the input before sending
      const cleanedStripeAccountId = stripeAccountId
        .trim()
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9_]/g, '');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/add-stripe-account`,
        {
          sellerId,
          stripeAccountId: cleanedStripeAccountId
        }
      );

      if (response.data.success) {
        setStripeConnectionStatus("connected");
        setTimeout(() => {
          router.push('/success');
        }, 2000);
      }
    } catch (error: any) {
      console.error("Stripe Account Submission Error:", error);
      setStripeConnectionStatus("error");
      alert(error.response?.data?.message || "Failed to connect Stripe account");
    }
  };
  

  
  // // Add this function for Razorpay integration

  // const [razorpayStatus, setRazorpayStatus] = useState("");

  // const setupRazorpay = async () => {
  //   try {
  //     setRazorpayStatus("setting_up");
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-razorpay-account`,
  //       { sellerId }
  //     );

  //     if (response.data.accountId) {
  //       setRazorpayStatus("account_created");
  //       // You might want to redirect to Razorpay's onboarding or show instructions
  //       alert("Razorpay account created! Please check your email to complete setup.");

  //       // Redirect to dashboard after a delay
  //       setTimeout(() => {
  //         router.push('/seller/dashboard');
  //       }, 3000);
  //     }
  //   } catch (error) {
  //     console.error("Razorpay Setup Error:", error);
  //     setRazorpayStatus("error");
  //     alert("Failed to setup Razorpay. Please try again.");
  //   }
  // };

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return interval;
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`,
        {
          ...sellerData,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    }
  });

  const onSubmit = async (data: any) => {
    signupMutation.mutate(data);
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  return (
    <div className='w-full flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4'>
      {/* Header Logo/Brand */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-[#0066CC]">iCommerce</h1>
        <p className="text-[#0047AB] mt-1">Seller Platform</p>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-md mb-8 px-4">
        <div className="flex items-center justify-between relative mb-12">
          {/* Background line - full width */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 transform -translate-y-1/2" />

          {/* Progress line - changes color based on active step */}
          <div
            className={`absolute top-1/2 h-1 transform -translate-y-1/2 transition-all duration-500 ${activeStep >= 2 ? 'bg-gradient-to-r from-[#0066CC] to-[#0047AB]' : 'bg-gray-300'
              }`}
            style={{
              width: activeStep >= 2 ? (activeStep >= 3 ? 'calc(100% - 2rem)' : '50%') : '0%',
              left: '2rem'
            }}
          />

          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${step <= activeStep
                  ? "bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white shadow-md"
                  : "bg-white text-gray-400 border border-gray-300"
                  }`}
              >
                {step}
              </div>
              <span className="text-sm mt-2 text-center text-gray-600 font-medium w-20 absolute top-full">
                {step === 1
                  ? "Create Account"
                  : step === 2
                    ? "Setup Shop"
                    : "Connect Bank"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className='w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden'>
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <>
                <div className='bg-gradient-to-r from-[#0066CC] to-[#0047AB] p-6 text-center'>
                  <h1 className='text-2xl font-bold text-white'>Create Seller Account</h1>
                  <p className='text-blue-100 mt-2'>Join our marketplace and start selling</p>
                </div>

                <div className='p-6'>
                  <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
                        {...register('name', {
                          required: "Name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters"
                          }
                        })}
                        placeholder='Enter your full name'
                      />
                      {errors.name && (
                        <p className='text-red-500 text-xs mt-1'>{errors.name.message?.toString()}</p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
                        {...register('email', {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                        placeholder='Enter your email'
                      />
                      {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message?.toString()}'</p>}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
                        {...register('phone_number', {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\+?[1-9]\d{1,14}$/,
                            message: "Invalid phone number format",
                          },
                          minLength: {
                            value: 10,
                            message: "Phone number must be at least 10 digits",
                          },
                          maxLength: {
                            value: 15,
                            message: "Phone number cannot exceed 15 digits",
                          },
                        })}
                        placeholder='Enter your phone number'
                      />
                      {errors.phone_number && <p className='text-red-500 text-xs mt-1'>{errors.phone_number.message?.toString()}</p>}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Country
                      </label>
                      <select
                        className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
                        {...register('country', {
                          required: "Country is required"
                        })}>
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {errors.country && <p className='text-red-500 text-xs mt-1'>{errors.country.message?.toString()}</p>}
                    </div>

                    <div className="relative">
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Password
                      </label>
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 outline-none"
                        placeholder="Create a password"
                        {...register("password", {
                          required: "Password is required",
                          pattern: {
                            value: /^(?=.*\S).{6,}$/,
                            message: "Password must be at least 6 characters"
                          }
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {passwordVisible ? <VscEye size={20} /> : <VscEyeClosed size={20} />}
                      </button>
                      {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message?.toString()}</p>}
                    </div>

                    <button
                      type="submit"
                      className='w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#0066CC] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center'
                      disabled={signupMutation.isPending}
                    >
                      {signupMutation.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating account...
                        </>
                      ) : 'Create Account'}
                    </button>

                    {signupMutation.isError && signupMutation.error instanceof AxiosError && (
                      <p className='text-red-500 text-xs mt-1 text-center'>{signupMutation.error.response?.data?.message}</p>
                    )}

                    <div className="text-center text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
                      Already have an account?{' '}
                      <Link href={'/login'} className='text-[#0066CC] hover:text-[#0047AB] font-medium transition-colors'>
                        Sign in
                      </Link>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className='text-xl font-semibold text-gray-800'>Verify Your Email</h3>
                  <p className='text-gray-600 mt-2'>We've sent a verification code to your email</p>
                </div>

                <div className='flex justify-center gap-3 mb-6'>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el
                      }}
                      maxLength={1}
                      className='w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      value={digit}
                    />
                  ))}
                </div>

                <button
                  onClick={() => verifyOtpMutation.mutate()}
                  disabled={verifyOtpMutation.isPending || otp.some(digit => digit === "")}
                  className='w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#0066CC] transition-colors shadow-md mb-4 disabled:opacity-70 flex items-center justify-center'
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : 'Verify OTP'}
                </button>

                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    {canResend ? (
                      <button
                        onClick={resendOtp}
                        className='text-[#0066CC] hover:text-[#0047AB] font-medium transition-colors'
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <p>Resend OTP in <span className="font-medium">{timer}s</span></p>
                    )}
                  </div>

                  {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-xs mt-2">
                      {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
        {activeStep === 3 && (
          <div className='p-6'>
            <div className='text-center mb-6'>
              <h3 className='text-xl font-semibold text-gray-800'>Connect Your Payment Account</h3>
              <p className='text-gray-600 mt-2'>Add your Stripe account ID to receive payments</p>

              <div className='mt-4 p-4 bg-yellow-50 rounded-lg'>
                <p className='text-sm text-yellow-700'>
                  <strong>Note:</strong> We're currently setting up our payment system. Your account ID will be stored now,
                  and you'll be able to receive payments once we complete our Stripe integration.
                </p>
              </div>
            </div>

            {showManualStripeInput ? (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Stripe Account ID
                  </label>
                  <input
                    type="text"
                    value={stripeAccountId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStripeAccountId(value);

                      // Provide real-time validation feedback
                      if (value && !value.trim().startsWith('acct_')) {
                        setStripeConnectionStatus("invalid_format");
                      } else {
                        setStripeConnectionStatus("");
                      }
                    }}
                    placeholder="acct_xxxxxxxxxxxx"
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${stripeConnectionStatus === "invalid_format" ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {stripeConnectionStatus === "invalid_format" && (
                    <p className="text-red-500 text-xs mt-1">
                      Stripe account IDs must start with "acct_"
                    </p>
                  )}
                  <p className='text-xs text-gray-500 mt-1'>
                    You can find this in your Stripe dashboard under Settings → Account details
                  </p>
                </div>

                <button
                  onClick={submitStripeAccountId}
                  disabled={stripeConnectionStatus === "connecting" || !stripeAccountId.startsWith('acct_')}
                  className='w-full py-3 px-4 bg-gradient-to-r from-[#0066CC] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#0066CC] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center'
                >
                  {stripeConnectionStatus === "connecting" ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : 'Save Stripe Account ID'}
                </button>
              </div>
            ) : (
              <div className='text-center'>
                <button
                  onClick={() => setShowManualStripeInput(true)}
                  className='bg-[#0066CC] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#0047AB] transition-colors shadow-md flex items-center justify-center mx-auto mb-4'
                >
                  Add Stripe Account ID <StripeLogo className="ml-2" />
                </button>

                <p className='text-sm text-gray-600'>
                  You'll need this to receive payments once our payment system is fully set up
                </p>
              </div>
            )}

            {stripeConnectionStatus === "connected" && (
              <div className='mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center'>
                <p>Stripe account ID saved successfully! Redirecting to dashboard...</p>
              </div>
            )}

            {stripeConnectionStatus === "error" && (
              <div className='mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center'>
                <p>Failed to save Stripe account ID. Please try again.</p>
              </div>
            )}
          </div>
        )}

        {/* {activeStep === 3 && (
          <div className='p-6 text-center'>
            <div className='text-center mb-6'>
              <h3 className='text-xl font-semibold text-gray-800'>Setup Payment Processing</h3>
              <p className='text-gray-600 mt-2'>Connect your Razorpay account to receive payments</p>
            </div>

            <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
              <p className='text-sm text-blue-700'>
                We use Razorpay to process payments. You'll need to complete a quick onboarding process to receive payments.
              </p>
            </div>

            <button
              onClick={setupRazorpay}
              disabled={razorpayStatus === "setting_up"}
              className='bg-[#0066CC] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#0047AB] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center mx-auto mb-4'
            >
              {razorpayStatus === "setting_up" ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up Razorpay...
                </>
              ) : (
                'Setup Razorpay Account'
              )}
            </button>

            {razorpayStatus === "account_created" && (
              <div className='mt-4 p-3 bg-green-100 text-green-700 rounded-lg'>
                <p>Razorpay account created successfully! Redirecting to dashboard...</p>
              </div>
            )}

            {razorpayStatus === "error" && (
              <div className='mt-4 p-3 bg-red-100 text-red-700 rounded-lg'>
                <p>Failed to setup Razorpay. Please try again.</p>
              </div>
            )}
          </div>
        )} */}
      </div>
    </div>
  )
}

export default Signup