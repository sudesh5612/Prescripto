import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets_frontend/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, token,getDoctorsData,backendUrl } = useContext(AppContext);
  const daysofWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId);
    setDocInfo(docInfo);
  };

const getAvailableSlots = async () => {
  let today = new Date();
  let allSlots = [];

  for (let i = 0; i < 7; i++) {
    let currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    if (i === 0) {
      let now = new Date();
      now.setSeconds(0, 0);
      if (now.getMinutes() > 30) {
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
      } else {
        now.setMinutes(30);
      }
      currentDate = new Date(now);
    } else {
      currentDate.setHours(10, 0, 0, 0);
    }

    let endTime = new Date(currentDate);
    endTime.setHours(21, 0, 0, 0);

    let timeSlots = [];
    let slotTime = new Date(currentDate);
    while (slotTime < endTime) {
      let formattedTime = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let day = currentDate.getDate();
      let month = currentDate.getMonth() + 1;
      let year = currentDate.getFullYear();

      const slotDate = day + "_" + month + "_" + year;
      const formattedSlotTime = formattedTime;

      const isSlOtAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(formattedSlotTime) ? false : true;

      if (isSlOtAvailable) {
        timeSlots.push({
          datetime: new Date(slotTime),
          time: formattedTime
        });
      }

      slotTime.setMinutes(slotTime.getMinutes() + 30);
    }

    allSlots.push(timeSlots);
  }

  setDocSlots(allSlots);
};




const bookAppointment = async () => {
  if (!token) {
    toast.warn('Login to book appointment');
    return navigate('/login');
  }

  try {
    const date = docSlots[slotIndex][0].datetime;

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    const slotDate = day + '_' + month + '_' + year;

    const { data } = await axios.post(
      backendUrl + '/api/user/book-appointment',
      { docId, slotDate, slotTime },
      { headers: { token } }
    );

    if (data.success) {
      toast.success(data.message);

      // Update local booked slots immediately
      setDocInfo(prev => {
        const updated = { ...prev };
        if (!updated.slots_booked[slotDate]) {
          updated.slots_booked[slotDate] = [];
        }
        updated.slots_booked[slotDate].push(slotTime);
        return updated;
      });

      // Refresh doctor data and redirect
      getDoctorsData();
      navigate('/my-appointments');
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};


  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  return docInfo && (
    <div>
      {/* ----------- Doctor Details ---------*/}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* ----------- Doc Info : name,degree,experience ---------*/} 
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p> 
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>  
          </div>
          {/* ----------- Doctor About ---------*/} 
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" /> 
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* ----------- Booking slots ---------*/} 
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length > 0 && docSlots.map((item, index) => (
              <div
                onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-[64px] rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}
                key={index}
              >
                {item.length > 0 ? (
                  <>
                    <p>{daysofWeek[new Date(item[0].datetime).getDay()]}</p>
                    <p>{new Date(item[0].datetime).getDate()}</p>
                  </>
                ) : (
                  <p className="text-gray-400">No slot</p>
                )}
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {
            docSlots.length > 0 && docSlots[slotIndex]?.map((item, index) => (
              <p
                onClick={() => setSlotTime(item.time)}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}
                key={index}
              >
                {item.time ? item.time.toLowerCase() : ''}
              </p>
            ))
          }
        </div>

        <button
          onClick={bookAppointment}
          className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'
        >
          Book an appointment
        </button>
      </div>

      {/* ----------- Listing Related Doctors ---------*/} 
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
}

export default Appointment;
