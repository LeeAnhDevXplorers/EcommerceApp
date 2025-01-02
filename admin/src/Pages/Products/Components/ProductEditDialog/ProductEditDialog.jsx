import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Slide from "@mui/material/Slide";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import ImageUpload from "../../../../Components/ImageUpload/ImageUpload";
import { fetchDataFromApi } from "../../../../utils/api";
import CountryDrop from "../../../../Components/CountryDrop/CountryDrop";
import { useContext } from "react";
import { MyContext } from "../../../../App";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
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
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const ProductEditDialog = ({
  handleClose,
  formFields,
  editPFun,
  Transition,
  open,
  changeInput,
  previews = [],
  onChangeFile,
  removeFile,
  handleSelectChange,
  selectCat,
  handleSelectSubCatChange,
}) => {
  const context = useContext(MyContext);
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);
  const [pRamData, setPRamData] = useState([]);
  const [pWeigthData, setPWeigthData] = useState([]);
  const [pSizeData, setPSizeData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  useEffect(() => {
    formFields.location = context.selectedCountry;
  }, [context.selectedCountry]);

  
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
          const res = await fetchDataFromApi(`/api/subCategory?categoryId=${formFields.category}`);
          if (Array.isArray(res.data)) {
            setSubCatData(res.data);
          } else {
            setSubCatData([]);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setSubCatData([]);
        } finally {
          setLoading(false);
        }
      };
  
      if (formFields.category) {
        fetchSubCategories();
      }
    }, [formFields.category]);
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

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      className="edit-modal"
    >
      <AppBar
        sx={{
          padding: "0 !impotion",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <Toolbar
          sx={{
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            position: "sticky",
            top: "0px",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ marginRight: "10px" }}
          >
            <IconButton edge="start" color="inherit" aria-label="close">
              <CloseIcon sx={{ fontSize: "2.4rem" }} />
            </IconButton>
            <Typography
              sx={{ ml: 2, flex: 1, fontSize: "1.6rem" }}
              component="div"
            >
              Đóng
            </Typography>
          </Button>
          <Button
            className="btn-blue btn-lg"
            type="submit"
            sx={{ fontSize: "1.8rem" }}
            autoFocus
            color="inherit"
            onClick={editPFun}
          >
            Lưu những thay đổi
          </Button>
        </Toolbar>
      </AppBar>{" "}
      <div className="grid grid-cols-2 grid-rows-7 gap-4">
        <div className="col-span-2 row-span-7">
          {" "}
          <List className="p-5">
            <TextField
              required
              id="outlined-required"
              label="Tên sản phẩm"
              fullWidth
              className="mb-4"
              defaultValue="name"
              name="name"
              value={formFields.name} 
              onChange={changeInput}
            />
            <textarea
              style={{
                width: "100%",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "1.6rem",
                padding: "10px",
                borderRadius: "10px",
              }}
              defaultValue="description"
              className="mb-4"
              required
              id="outlined-required"
              label="Mô tả sản phẩm"
              rows="5"
              cols="10"
              name="description"
              onChange={changeInput}
              value={formFields.description}
            ></textarea>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <TextField
                  fullWidth
                  className="mb-4"
                  id="outlined-required"
                  type="text"
                  label="Giảm giá (%)"
                  name="discount"
                  onChange={changeInput}
                  value={formFields.discount}
                />
              </div>
              <div className="">
                <TextField
                  required
                  id="outlined-required"
                  label="Giá cũ"
                  fullWidth
                  className="mb-4"
                  defaultValue="oldPrice"
                  name="oldPrice"
                  value={formFields.oldPrice} 
                  onChange={changeInput}
                />
              </div>
              <div className="">
                <TextField
                  autoFocus
                  required
                  id="outlined-required"
                  label="Địa điểm"
                  fullWidth
                  className="mb-4"
                  name="brand"
                  defaultValue="brand"
                  value={formFields.brand}
                  onChange={changeInput}
                />
              </div>
              <div className="">
                <TextField
                  required
                  id="outlined-required"
                  label="Tồn kho"
                  fullWidth
                  className="mb-4"
                  defaultValue="countInStock"
                  name="countInStock"
                  value={formFields.countInStock} 
                  onChange={changeInput}
                />
              </div>
            </div>
            <div className="">
              <h6
                style={{
                  fontSize: "1.6rem",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                Bạn vui lòng nhập lại giá trị mới khi chỉnh sửa (Nếu không chọn
                sẽ mất)
              </h6>
              <div className="d-flex gap-4">
                <div className="w-100">
                  <Select
                    value={formFields.category}
                    onChange={(e) => handleSelectChange(e, "category")}
                    displayEmpty
                    className="w-100"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {loading ? (
                      <CircularProgress size={24} />
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
                <div className="w-100">
                  <Select
                    value={formFields.subCatVal}
                    onChange={handleSelectSubCatChange}
                    displayEmpty
                    className="w-100"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {subCatData.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={item._id || ""}
                        onClick={handleSelectSubCatChange}
                      >
                        {item.subCat || "Không có danh mục phụ"}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="d-flex gap-4 mt-3">
                <div className="w-100">
                  <Select
                    className="w-100"
                    multiple
                    value={
                      Array.isArray(formFields.ramName)
                        ? formFields.ramName
                        : []
                    }
                    onChange={(e) => handleSelectChange(e, "ramName")}
                    MenuProps={MenuProps}
                  >
                    {pRamData.map((w) => (
                      <MenuItem
                        key={w._id}
                        value={w._id}
                        style={getStyles(w, pRamData, theme)}
                      >
                        {w.ramName}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <div className="w-100">
                  <Select
                    className="w-100"
                    multiple
                    value={
                      Array.isArray(formFields.weightName)
                        ? formFields.weightName
                        : []
                    }
                    onChange={(e) => handleSelectChange(e, "weightName")}
                    MenuProps={MenuProps}
                  >
                    {pWeigthData.map((w) => (
                      <MenuItem
                        key={w._id}
                        value={w._id}
                        style={getStyles(w, pWeigthData, theme)}
                      >
                        {w.weightName}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <div className="w-100">
                  <Select
                    className="w-100"
                    multiple
                    value={
                      Array.isArray(formFields.sizeName)
                        ? formFields.sizeName
                        : []
                    }
                    onChange={(e) => handleSelectChange(e, "sizeName")}
                    MenuProps={MenuProps}
                  >
                    {pSizeData.map((w) => (
                      <MenuItem
                        key={w._id}
                        value={w._id}
                        style={getStyles(w, pSizeData, theme)}
                      >
                        {w.sizeName}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="row">
                <div className="form-group" style={{ padding: "15px" }}>
                  <h5>ĐỊA ĐIỂM</h5>
                  {context.countryList.length !== 0 && (
                    <CountryDrop
                      countryList={context.countryList}
                      selectedLocation={formFields.location}
                    />
                  )}
                </div>
              </div>
            </div>
          </List>
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <ImageUpload
          previews={previews}
          onChangeFile={onChangeFile}
          removeFile={removeFile}
        />
      </div>
    </Dialog>
  );
};

export default ProductEditDialog;
