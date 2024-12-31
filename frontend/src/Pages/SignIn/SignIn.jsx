import { Backdrop, CircularProgress } from "@mui/material/";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { assets } from "../../assets/assets";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseApp } from "../../firebase.js";
import "./SignIn.css";
import { postData } from "../../utils/api";

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

const SignIn = () => {
  const context = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
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

  const signInGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;

        const fields = {
          name: user.providerData[0].displayName,
          email: user.providerData[0].email,
          password: null,
          images: user.providerData[0].photoURL,
          phone: user.providerData[0].phoneNumber,
        };

        postData(`/api/users/authWithGoogle`, fields).then((response) => {
          try {
            if (response.status) {
              localStorage.setItem("token", response.token);

              const user = {
                name: response.user?.name || "",
                email: response.user?.email || "",
                userId: response.user?._id || "",
              };
              localStorage.setItem("user", JSON.stringify(user));

              context.setAlertBox({
                open: true,
                error: false,
                msg: response.msg || "Đăng nhập thành công.",
              });

              setTimeout(() => {
                window.location.href = "/";
              }, 1000);
            } else {
              context.setAlertBox({
                open: true,
                error: true,
                msg: response.msg || "Đăng nhập thất bại.",
              });
            }
          } catch (error) {
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Error processing response.",
              errorMsg: error.message,
            });
          }
        });
      })
      .catch((error) => {
        console.error("Error during sign in:", error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Sign in failed.",
          errorMsg: error.message,
        });
      });
  };

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await postData("/api/user/signin", formFields);

      if (response.status) {
        localStorage.setItem("token", response.token);

        const user = {
          name: response.user?.name || "",
          email: response.user?.email || "",
          userId: response.user?._id || "",
        };
        localStorage.setItem("user", JSON.stringify(user));
        context.setAlertBox({
          open: true,
          error: false,
          msg: response.msg || "Đăng nhập thành công.",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: response.msg || "Đăng nhập thất bại.",
        });
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      context.setAlertBox({
        open: true,
        error: true,
        msg: "Sai EMAIL hoặc MẬT KHẨU. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const forgotPass = () => {
    if (formFields.email === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Vui lòng nhập email của bạn.",
      });
    } else {
      localStorage.setItem("userEmail", formFields.email);
      localStorage.setItem("actionType", "forgotPass");
      postData("/api/user/forgotPass", { email: formFields.email })
        .then((res) => {
          if (res.status) {
            context.setAlertBox({
              open: true,
              error: false,
              msg: res.msg || "Mã OTP đã được gửi đến email của bạn.",
            });
            window.location.href = "/verify-otp";
          } else {
            context.setAlertBox({
              open: true,
              error: true,
              msg: res.msg || "Gửi mã OTP thất bại.",
            });
          }
        })
        .catch((error) => {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
            errorMsg: error.message,
          });
        });
    }
  };

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
            <h2 className="mb-4">Đăng nhập</h2>
            <form action="" className="mt-3" onSubmit={signIn}>
              <div className="form-group">
                <TextField
                  id="standard-basic"
                  label="Email"
                  type="email"
                  name="email"
                  onChange={onchangeInput}
                  variant="standard"
                  required
                  className="w-100"
                />
              </div>
              <div className="form-group mb-4">
                <TextField
                  id="standard-basic"
                  label="Mật khẩu"
                  type="password"
                  variant="standard"
                  required
                  className="w-100"
                  name="password"
                  onChange={onchangeInput}
                />
              </div>
              <a className="border-effect cursor" onClick={forgotPass}>
                Quên mật khẩu?{" "}
              </a>
              <div className="d-flex align-items-center mt-3 mb-3 row">
                <Button
                  type="submit"
                  className="btn col btn-blue btn-lg btn-big"
                >
                  Đăng nhập
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
              <p>
                Bạn chưa có tài khoản?
                <Link className="border-effect cursor" to={"/signUp"}>
                  Đăng ký
                </Link>
              </p>
              <h4 className="social  text-center font-weight-bold mt-5">
                Hoặc tiếp tục với tài khoản xã hội
              </h4>
              <div className="form-btn">
                <Button className="logoBtn" onClick={signInGoogle}>
                  <span className="cursor">
                    <img
                      className="w-100"
                      src={assets.btn_sigin_google}
                      alt=""
                    />
                  </span>
                </Button>
                <Button className="logoBtn">
                  <span className="cursor">
                    <img className="w-100" src={assets.btn_sigin_fb} alt="" />
                  </span>
                </Button>
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

export default SignIn;
