import React, { useState } from "react";
import { forgotPassword } from "../services/api";

const ForgotPassword: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await forgotPassword(emailOrPhone);
      setMessage(data);
    } catch (err) {
      setMessage("No account found. Contact support at support@trinity.com");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email or Phone</label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              placeholder="Enter email or phone"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
          >
            Send Reset Link
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;