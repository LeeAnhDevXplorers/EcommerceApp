import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { editData, fetchDataFromApi } from "../../utils/api";
import { Button, Form, Input } from "antd";
import PropTypes from "prop-types";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { alpha, styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
const MyAccount = (props) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [isLogin, setIsLogin] = useState(false);
  const history = useNavigate();
  const [formFields, setFormFields] = useState({
    name: "",
    phone: "",
    email: "",
    images: [],
  });
  const [preview, setPreview] = useState([]);
  const formdata = new FormData();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [editID, setEditID] = useState(null);

  const changeInput = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };
  const onChangeFile = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    setFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);

    const imgArr = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviews((prevArr) => [...prevArr, ...imgArr]);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem("token");
    if (token !== "" && token !== null && token !== undefined) {
      setIsLogin(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        editusers(user._id);
      }
    } else {
      history("/signin");
    }
  }, []);

  const editusers = async (_id) => {
    setOpen(true);
    setEditID(_id);
    try {
      const res = await fetchDataFromApi(`/api/users/${_id}`);
      if (res) {
        setFormFields({
          name: res.name,
          phone: res.phone,
          email: res.email,
        });
        // Set previews from existing images
        setPreview(res.images || []);
      }
    } catch (error) {
      console.error("Failed to fetch category data:", error);
    }
  };

  const edituser = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', formFields.name);
    formData.append('phone', formFields.phone);
    formData.append('email', formFields.email);
    
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await editData(`/api/users/${editID}`, formData);

      if (response.ok) {
        const result = await response.json();
        const user = JSON.parse(localStorage.getItem("user"));
        localStorage.setItem("user", JSON.stringify({
          ...user,
          name: result.name,
          phone: result.phone
        }));
        alert("Profile updated successfully");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  return (
    <section className="section my-account p-10">
      <div className="container">
        <h2 className="hd">Tài khoản của bạn</h2>
        <Box
          sx={{ width: "100%" }}
          className="my_account-box mt-5 card shadow border-0"
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Edit Profile" {...a11yProps(0)} />
              <Tab label="Change Password" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <form onSubmit={edituser}>
              <div className="row">
                <div className="col-md-4">
                  <div className="user-img">
                    <img
                      src={previews[0] || formFields.images[0] || "default-avatar-url"}
                      alt=""
                    />
                    <div className="overlay d-flex align-items-center justify-content-center">
                      <CloudUploadIcon />
                      <input type="file" onChange={onChangeFile} accept="image/*" />
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <FormControl variant="standard" className="w-100">
                          <InputLabel
                            sx={{ fontSize: "1.6rem" }}
                            shrink
                            htmlFor="name-input"
                          >
                            Họ tên của bạn
                          </InputLabel>
                          <BootstrapInput
                            className="w-100"
                            id="name-input"
                            name="name"
                            value={formFields.name}
                            onChange={changeInput}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <FormControl variant="standard" fullWidth>
                          <InputLabel
                            sx={{ fontSize: "1.6rem" }}
                            shrink
                            htmlFor="phone-input"
                          >
                            Số điện thoại
                          </InputLabel>
                          <BootstrapInput
                            id="phone-input"
                            name="phone"
                            value={formFields.phone}
                            onChange={changeInput}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <FormControl variant="standard" fullWidth>
                          <InputLabel
                            sx={{ fontSize: "1.6rem" }}
                            shrink
                            htmlFor="email-input"
                          >
                            Email
                          </InputLabel>
                          <BootstrapInput
                            id="email-input"
                            name="email"
                            value={formFields.email}
                            disabled
                          />
                        </FormControl>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <Button variant="outlined" type="submit">
                      Lưu
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <form>
              <div className="row">
                <div className="col-md-12">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <FormControl variant="standard" className="w-100">
                          <InputLabel
                            sx={{ fontSize: "1.6rem" }}
                            shrink
                            htmlFor="bootstrap-input"
                            className="w-100"
                          >
                            Name
                          </InputLabel>
                          <BootstrapInput
                            className="w-100"
                            id="bootstrap-input"
                          />
                        </FormControl>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <FormControl variant="standard" fullWidth>
                          <InputLabel
                            sx={{ fontSize: "1.6rem" }}
                            shrink
                            htmlFor="bootstrap-input"
                          >
                            Phone
                          </InputLabel>
                          <BootstrapInput id="bootstrap-input" />
                        </FormControl>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <FormControl variant="standard" fullWidth>
                          <InputLabel
                            sx={{ fontSize: "1.6rem" }}
                            shrink
                            htmlFor="bootstrap-input"
                          >
                            Email
                          </InputLabel>
                          <BootstrapInput id="bootstrap-input" />
                        </FormControl>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <Button variant="outlined">Save</Button>
                  </div>
                </div>
              </div>
            </form>
          </CustomTabPanel>
        </Box>
      </div>
    </section>
  );
};

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "#F3F6F9",
    border: "1px solid",
    borderColor: "#E0E3E7",
    fontSize: 16,
    width: "auto",
    padding: "10px 12px",
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
    ...theme.applyStyles("dark", {
      backgroundColor: "#1A2027",
      borderColor: "#2D3843",
    }),
  },
}));

export default MyAccount;
