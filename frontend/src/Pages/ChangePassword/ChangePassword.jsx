import { Backdrop, CircularProgress } from "@mui/material/";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { assets } from "../../assets/assets";
import { postData } from "../../utils/api";

const ChangePassword = () => {
  const context = useContext(MyContext);
  const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
  const [formFields, setFormFields] = useState({
    email: localStorage.getItem("userEmail"),
    newPass: "",
    confirmPass: "",
  });
  useEffect(() => {
    context.setisHeaderFooterShow(false);
  });

  const onchangeInput = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };

  const changePass = async (e) => {
    e.preventDefault();
    if (formFields.newPass !== formFields.confirmPass) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Mật khẩu không khớp",
      });
      return;
    }
    if (formFields.newPass.length < 6) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Mật khẩu phải có ít nhất 6 ký tự",
      });
      return;
    }
    if (formFields.newPass === "" || formFields.confirmPass === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Vui lòng nhập mật khẩu mới",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await postData(`/api/user/forgotPass/changePassword`, formFields);
      if (res.status) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Đổi mật khẩu thành công!",
        });
        setTimeout(() => {
          navigate("/signIn");
        }, 2000);
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res.msg,
        });
      }
    } catch (error) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Có lỗi xảy ra, vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="section signInPage">
        <div className="shape-bottom">
          <svg
            fill="#fff"
            id="Layer_1"
            x="0px"
            y="0px"
            viewBox="0 0 1921 819.8"
            style={{ enableBackground: "new 0 0 1921 819.8" }}
          >
            <path
              class="st0"
              d="M1921,413.1v406.7H0V0.5h0.4l228.1,598.3c30,74.4,80.8,130.6,152.5,168.6c107.6,57,212.1,40.7,245.7,34.4 c22.4-4.2,54.9-13.1,97.5-26.6L1921,400.5V413.1z"
            ></path>
          </svg>
        </div>
        <div className="container">
          <div className="box card shadow border-0">
            <div className="text-center">
              <img src={assets.logo} alt="" />
            </div>
            <h2 className="mb-4">Đổi mật khẩu</h2>
            <form action="" className="mt-3" onSubmit={changePass}>
              <div className="form-group">
                <TextField
                  id="standard-basic"
                  label="Mật Khẩu Mới"
                  type="password"
                  name="newPass"
                  onChange={onchangeInput}
                  variant="standard"
                  required
                  className="w-100"
                />
              </div>
              <div className="form-group">
                <TextField
                  id="standard-basic"
                  label="Nhập Lại Mật Khẩu Mới"
                  type="password"
                  name="confirmPass"
                  onChange={onchangeInput}
                  variant="standard"
                  required
                  className="w-100"
                />
              </div>
              <div className="d-flex align-items-center mt-3 mb-3 row">
                <Button
                  type="submit"
                  className="btn col btn-blue btn-lg btn-big"
                >
                  Đổi mật khẩu
                </Button>
                <Link to={"/"}>
                  <Button
                    className="btn col btn-lg btn-big col ml-3"
                    variant="outlined"
                    onClick={() => context.setisHeaderFooterShow(true)}
                  >
                    Đóng
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Backdrop
        sx={{
          color: "#fff",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          transition: "opacity 0.3s ease-in-out",
          zIndex: 9999,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={50} thickness={2} />
      </Backdrop>
    </div>
  );
};

export default ChangePassword;
