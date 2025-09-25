import React from "react";

export default function CheckEmail() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-4">Check your email</h1>
                <p className="mb-6 text-gray-700">
                    We’ve sent you an email with a link to verify your account. Please check your inbox and follow the instructions to continue.
                </p>
                <div className="mb-4">
                    <svg
                        className="mx-auto h-16 w-16 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <path d="M22 5L12 13 2 5" />
                    </svg>
                </div>
                <p className="text-sm text-gray-500">
                    Didn’t receive the email? Check your spam folder or{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                        resend
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}