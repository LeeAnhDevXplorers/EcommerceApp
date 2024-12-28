import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { IoShieldCheckmark } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const context = useContext(MyContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state;

  useEffect(() => {
    context.setisHeaderFooterShow(false);
  }, [context]); // Add dependency array

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

    try {
      const res = await postData('/api/user/verify', { userId, otp: otpCode });

      if (res.status) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: 'Xác thực thành công!',
        });

        navigate('/signIn'); // Redirect to sign-in page after successful verification
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res.msg,
        });
      }
    } catch (error) {
      console.error('Xác thực OTP thất bại:', error);

      context.setAlertBox({
        open: true,
        error: true,
        msg: error.response?.data?.msg || 'Có lỗi xảy ra, vui lòng thử lại!',
      });
    }
  };

  return (
    <div className="otp-background">
      <form className="otp-container" onSubmit={handleSubmit}>
        <div className="otp-header">
          <IoShieldCheckmark className="otp-icon" />
          <h2 className="otp-title">OTP Verification</h2>
          <p className="otp-title">Nhập mã OTP đã được gửi vào email của bạn</p>
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
          Xác nhận OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;
