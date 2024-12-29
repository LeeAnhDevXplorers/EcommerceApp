import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import HomeIcon from "@mui/icons-material/Home";
import {
  Backdrop,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { emphasize, styled } from "@mui/material/styles";
import React, { useContext, useEffect, useRef, useState } from "react";
import { TiDelete } from "react-icons/ti";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData } from "../../utils/api";
import "./ProductUpload.css";
import CountryDrop from "../../Components/CountryDrop/CountryDrop";

const StyleBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

const ProductUpload = () => {
  const [pRamData, setPRamData] = useState([]);
  const [pWeigthData, setPWeigthData] = useState([]);
  const [pSizeData, setPSizeData] = useState([]);
  const context = useContext(MyContext);
  const [catData, setCatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]); 
  const [subCatVal, setSubCatVal] = useState();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formFields, setFormFields] = useState({
    name: "",
    description: "",
    images: [],
    brand: "",
    price: "",
    oldPrice: "",
    category: "",
    subCat: "",
    catName: "",
    subName: "",
    countInStock: "",
    discount: 0,
    weightName: [],
    ramName: [],
    sizeName: [],
    isFeatured: false,
    location,
  });

  useEffect(() => {
    formFields.location = context.selectedCountry;
  }, [context.selectedCountry]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [prams, weights, sizes] = await Promise.all([
          fetchDataFromApi("/api/prams"),
          fetchDataFromApi("/api/weight"),
          fetchDataFromApi("/api/psize"),
        ]);
        setPRamData(prams.data || []);
        setPWeigthData(weights.data || []);
        setPSizeData(sizes.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDataFromApi("/api/category")
      .then((res) => {
        if (Array.isArray(res.categoryList)) {
          setCatData(res.categoryList);
        } else {
          setCatData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setCatData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);



  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      try {
        await fetchDataFromApi("/api/subCategory").then((res) => {
     
          if (Array.isArray(res.data)) {
            setSubCategories(res.data);
          } else {
            setSubCategories([]);
          }
        });
      } catch (error) {
        console.error("Lỗi khi lấy subCategories:", error);
        setSubCategories([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories(); 
  }, []); 

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onChangeFile = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const imgArr = Array.from(files)
      .filter((file) => validTypes.includes(file.type))
      .map((file) => URL.createObjectURL(file));

    if (imgArr.length === 0) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Chỉ được tải lên file ảnh (JPEG, PNG, JPG)!",
      });
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...files]);
    setPreviews((prevArr) => [...prevArr, ...imgArr]);
  };

const removeFile = async (url) => {
  const fileIndex = previews.findIndex((preview) => preview === url);
  if (fileIndex === -1) return; 

  const fileToRemove = files[fileIndex];

  try {
    const response = await fetch("/api/products/delete-image", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId: fileToRemove.name }), 
    });

    const result = await response.json();
    if (result.success) {
      setFiles((prevFiles) =>
        prevFiles.filter((_, index) => index !== fileIndex)
      );
      setPreviews((prevPreviews) =>
        prevPreviews.filter((_, index) => index !== fileIndex)
      );
    } else {
      console.error("Failed to delete image:", result.message);
    }
  } catch (error) {
    console.error("Error while deleting image:", error);
  }
};

  const handleSelectChange = (e, fieldName) => {
    setFormFields((prev) => ({
      ...prev,
      [fieldName]: e.target.value,
    }));
  };

  const handleSelectSubCatChange = (e) => {
    setSubCatVal(e.target.value);
    setFormFields(() => ({
      ...formFields,
      subCat: e.target.value,
    }));
    formFields.subName = e.target.value;
  };

  const selectCat = (cat) => {
    formFields.catName = cat;
  };

  const addProduct = async (event) => {
    event.preventDefault();
    setLoading(true);

    const {
      name,
      category,
      subCat,
      catName,
      subName,
      description,
      brand,
      oldPrice,
      countInStock,
      discount,
      weightName,
      ramName,
      sizeName,
      isFeatured,
      location,
    } = formFields;

    if (!name || !oldPrice || !category || !subCat || files.length === 0) {
      setLoading(false);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Vui lòng nhập đầy đủ, không được bỏ trống!",
      });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("category", category._id || category);
      fd.append("subCat", subCat._id || subCat);
      fd.append("catName", formFields.catName);
      fd.append("subName", formFields.subName);
      fd.append("description", description || "");
      fd.append("brand", brand || "");
      fd.append("oldPrice", oldPrice);
      fd.append("countInStock", countInStock || 0);
      fd.append("discount", discount || 0);
      fd.append("location", location || "");

      if (weightName.length) fd.append("weightName", weightName.join(","));
      if (ramName.length) fd.append("ramName", ramName.join(","));
      if (sizeName.length) fd.append("sizeName", sizeName.join(","));

      fd.append("isFeatured", Boolean(isFeatured));

      files.forEach((file) => fd.append("images", file));

      console.log(formFields);

      const response = await postData("/api/products/create", fd);

      if (response.success) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Bạn đã thêm sản phẩm thành công!",
        });
        setFormFields({
          name: "",
          description: "",
          images: [],
          brand: "",
          oldPrice: "",
          category: "",
          subCat: "",
          countInStock: "",
          discount: 0,
          weightName: [],
          ramName: [],
          sizeName: [],
          isFeatured: false,
          location: "",
        });
        setFiles([]);
        setPreviews([]);
        navigate("/product/productlist");
      } else {
        throw new Error(response.message || "Thêm sản phẩm thất bại");
      }
    } catch (error) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: error.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4">
        <h5 className="mb-0">Tải lên sản phẩm</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyleBreadcrumb
            component="a"
            href="/"
            label="Bảng điều khiển"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyleBreadcrumb
            href="#"
            label="Sản phẩm"
            deleteIcon={<ExpandMoreIcon />}
          />
          <StyleBreadcrumb label="Tải lên sản phẩm" />
        </Breadcrumbs>
      </div>
      <form onSubmit={addProduct} className="form">
        <div className="row">
          <div className="col-md-12">
            <div className="card mt-0 p4 w-100">
              <h5 className="mb-5 !text-4xl">Nhập thông tin sản phẩm</h5>
              <div className="form-group mb-4">
                <h6 className="mb-2">Tên sản phẩm</h6>
                <input
                  type="text"
                  name="name"
                  value={formFields.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <h6>Mô tả sản phẩm</h6>
                <textarea
                  rows="5"
                  cols="10"
                  name="description"
                  onChange={handleInputChange}
                  value={formFields.description}
                ></textarea>
              </div>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <h6>Danh mục</h6>
                    <Select
                      value={formFields.category || ""}
                      onChange={(e) => handleSelectChange(e, "category")}
                      displayEmpty
                      className="w-100"
                    >
                      <MenuItem value="">
                        <em>Không có</em>
                      </MenuItem>
                      {catData.length === 0 ? (
                        <MenuItem disabled>Không tìm thấy danh mục</MenuItem>
                      ) : (
                        catData.map((item, index) => (
                          <MenuItem
                            key={index}
                            value={item._id}
                            onClick={() => selectCat(item.name)}
                          >
                            {item.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <h6>Danh mục con</h6>
                    <Select
                      value={subCatVal}
                      onChange={handleSelectSubCatChange}
                      displayEmpty
                      className="w-100"
                    >
                      <MenuItem value="">
                        <em>Không có</em>
                      </MenuItem>
                      {subCategories?.map((item, index) => (
                        <MenuItem key={index} value={item._id}>
                          {item.subCat || "Không có danh mục con"}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <h6>Giá sản phẩm</h6>
                    <input
                      type="text"
                      name="oldPrice"
                      onChange={handleInputChange}
                      value={formFields.oldPrice}
                    />
                  </div>
                </div>

                <div className="col">
                  <div className="form-group">
                    <h6>Tồn kho</h6>
                    <input
                      type="text"
                      name="countInStock"
                      onChange={handleInputChange}
                      value={formFields.countInStock}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <h6>Địa chỉ</h6>
                    <input
                      type="text"
                      name="brand"
                      onChange={handleInputChange}
                      value={formFields.brand}
                    />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <h6>Đặc trưng</h6>
                    <Select
                      value={formFields.isFeatured}
                      onChange={(e) => handleSelectChange(e, "isFeatured")}
                      name="isFeatured"
                      displayEmpty
                      className="w-100"
                    >
                      <MenuItem value={false}>Không</MenuItem>
                      <MenuItem value={true}>Có</MenuItem>
                    </Select>
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <h6>Giảm giá (%)</h6>
                    <input
                      type="text"
                      name="discount"
                      onChange={handleInputChange}
                      value={formFields.discount}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <h6>RAM SẢN PHẨM</h6>
                    <FormControl sx={{ m: 1, width: "100%" }}>
                      <Select
                        multiple
                        value={formFields.ramName || []} // Ensure this is an array
                        onChange={(e) => handleSelectChange(e, "ramName")}
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {pRamData.map((item) => (
                          <MenuItem key={item._id} value={item.ramName}>
                            {item.ramName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <h6>TRỌNG LƯỢNG SẢN PHẨM</h6>
                    <FormControl sx={{ m: 1, width: "100%" }}>
                      <Select
                        multiple
                        value={formFields.weightName || []} // Ensure this is an array
                        onChange={(e) => handleSelectChange(e, "weightName")}
                        renderValue={(selected) => (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              fontSize: "1.6rem",
                            }}
                          >
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {pWeigthData.map((item) => (
                          <MenuItem key={item._id} value={item.weightName}>
                            {item.weightName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <h6>KÍCH THƯỚC SẢN PHẨM</h6>
                    <FormControl sx={{ m: 1, width: "100%" }}>
                      <Select
                        multiple
                        value={formFields.sizeName || []} // Ensure this is an array
                        onChange={(e) => handleSelectChange(e, "sizeName")}
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => (
                              <Chip key={value} label={value} />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {pSizeData.map((item) => (
                          <MenuItem key={item._id} value={item.sizeName}>
                            {item.sizeName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="form-group">
                  <h5>ĐỊA ĐIỂM</h5>
                  {context.countryList.length !== 0 && <CountryDrop />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 mt-0 w-100">
          <div className="imagesUploadSec">
            <h5 className="mb-4">Phương tiện và xuất bản</h5>
            <div className="imgUploadBox d-flex align-items-center">
              {previews.length !== 0 &&
                previews.map((item, index) => (
                  <div className="uploadBox d-flex" key={index}>
                    <span
                      onClick={() => removeFile(item, index)}
                      className="remove"
                    >
                      <TiDelete />
                    </span>
                    <div className="box">
                      <span
                        className="lazy-load-image-background blur lazy-load-image-loaded"
                        style={{
                          color: "transparent",
                          display: "inline-block",
                        }}
                      >
                        <img alt="image" className="w-100 h-100" src={item} />
                      </span>
                    </div>
                  </div>
                ))}
              <div className="uploadBox">
                <input
                  type="file"
                  multiple
                  onChange={(e) => onChangeFile(e, "/api/products/upload")}
                  name="images"
                />
                <div className="info">
                 
                  <h5>Tải lên hình ảnh</h5>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="btn-blue btn-big btn-lg btn-round w-100 mt-5"
            >
              &nbsp; XUẤT BẢN VÀ XEM
            </Button>
          </div>
        </div>
      </form>
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

export default ProductUpload;
