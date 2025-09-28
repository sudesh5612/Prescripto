import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Verify = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const success = searchParams.get('success');
  const appointmentId = searchParams.get('appointmentId');

  const verifyPayment = async () => {
    if (!token) return; // wait until token is available

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/verify-payment`,
        { success, appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success('Payment verified successfully!');
      } else {
        toast.error(data.message || 'Payment verification failed.');
      }

      // Navigate to appointments page in both cases
      navigate('/my-appointments');

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong during verification.');
      navigate('/my-appointments'); // redirect to a valid route
    }
  };

  useEffect(() => {
    if (token) verifyPayment();
  }, [token]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-zinc-600 text-lg">Verifying payment, please wait...</p>
    </div>
  );
};

export default Verify;
