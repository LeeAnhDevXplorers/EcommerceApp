import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { IoShieldCheckmark } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('tempUserData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
    context.setisHide(false);
    return () => {
      context.setisHide(true);
    };
  }, [context]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    const actionType = localStorage.getItem("actionType");

    if (!userData?.email) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "User data not found",
      });
      return;
    }

    if (otpCode) {
      try {
        const res = await postData("/api/user/verify", { 
          email: userData.email, 
          otp: otpCode 
        });

        if (res.status) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: "Xác thực thành công!",
          });
          localStorage.removeItem('tempUserData');
          localStorage.removeItem('actionType');
          
          navigate("/login");
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.msg,
          });
        }
      } catch (error) {
        console.error('OTP verification failed:', error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: error.response?.data?.msg || 'An error occurred. Please try again!',
        });
      }
    } else {
      context.setAlertBox({
        open: true,
        msg: "Vui lòng nhập mã OTP.",
      });
    }
  };

  return (
    <div className="otp-background">
      <form className="otp-container" onSubmit={handleSubmit}>
        <div className="otp-header">
          <IoShieldCheckmark className="otp-icon" />
          <h2 className="otp-title">OTP Verification</h2>
          <p className="otp-title">Enter the OTP code sent to your email</p>
        </div>
        <div className="otp-input-group">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="otp-input"
            />
          ))}
        </div>
        <button type="submit" className="otp-submit-button">
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;
