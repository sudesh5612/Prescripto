import React, { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  const { backendUrl, token } = useContext(AppContext);

  useEffect(() => {
    if (!sessionId) return;

    const confirmPayment = async () => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/user/payment-stripe/confirm`,
          { sessionId },
          { headers: { token } }
        );

        if (data.success) {
          toast.success("Payment confirmed and appointment updated.");
        } else {
          toast.error("Payment confirmation failed: " + data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    confirmPayment();

    // Auto redirect after 7 seconds
    const timer = setTimeout(() => {
      navigate("/my-appointments");
    }, 7000);

    return () => clearTimeout(timer);
  }, [sessionId, backendUrl, token, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-extrabold mb-6 text-green-600">
          Payment Successful!
        </h1>
        {sessionId ? (
          <p className="text-lg mb-6 text-gray-900">
            Your session ID is:{" "}
            <span className="font-mono bg-gray-100 px-3 py-1 rounded">
              {sessionId}
            </span>
          </p>
        ) : (
          <p className="text-lg mb-6 text-red-500">
            No session ID found in URL.
          </p>
        )}
        <p className="text-gray-700 text-base mb-8">
          Thank you for your payment. Your appointment is now confirmed.
        </p>

        <button
          onClick={() => navigate("/my-appointments")}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition"
        >
          Go to My Appointments
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
