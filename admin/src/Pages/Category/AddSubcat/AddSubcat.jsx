import { Backdrop, Button, CircularProgress } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../../App';
import { bgColor } from '../../../assets/assets';
import { fetchDataFromApi, postData } from '../../../utils/api';
import BreadcrumbsNav from '../Components/BreadcrumbsNav/BreadcrumbsNav';
import CategoryForm from '../Components/CategoryForm/CategoryForm';
// import './Pages/CategoryAdd.css';

const AddSubcat = () => {
  const [categoryVal, setCategoryVal] = useState('');
  const context = useContext(MyContext);
  const [catData, setCatData] = useState([]);
  const navigate = useNavigate();
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formFields, setFormFields] = useState({
    category: '',
    subCat: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    console.log('Đang lấy dữ liệu danh mục...');
    setLoading(true);
    fetchDataFromApi('/api/category') 
      .then((res) => {
        console.log('Danh mục đã lấy:', res); 
        if (Array.isArray(res.categoryList)) {
          setCatData(res.categoryList);
        } else {
          setCatData([]);
        }
      })
      .catch((error) => {
        console.error('Lỗi khi lấy danh mục:', error); 
        setCatData([]);
      })
      .finally(() => {
        setLoading(false);
        console.log('Hoàn thành lấy dữ liệu danh mục'); 
      });
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formFields.category) errors.category = 'Tên danh mục là bắt buộc';
    if (!formFields.subCat) errors.subCat = 'Tên danh mục con là bắt buộc';
    return Object.keys(errors).length === 0;
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Thay đổi đầu vào: ${name} = ${value}`);
    setFormFields((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      console.log('Cập nhật trường biểu mẫu:', updated);
      return updated;
    });
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    console.log('Danh mục đã chọn:', value);
    setCategoryVal(value);
    setFormFields((prev) => {
      const updated = {
        ...prev,
        category: value,
      };
      console.log('Cập nhật trường biểu mẫu sau khi chọn:', updated);
      return updated;
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Bắt đầu gửi biểu mẫu');
  setLoading(true);

  if (!validateForm()) {
    setLoading(false);
    console.log('Xác thực biểu mẫu thất bại');
    return;
  }

  const data = {
    category: formFields.category,
    subCat: formFields.subCat,
  };

  try {
    const res = await postData('/api/subCategory/create', data);
    console.log('Phản hồi API:', res);
    if (res.success) {
      navigate('/category/categorylist');
      context.setAlertBox({
        open: true,
        error: false,
        msg: 'Tạo danh mục thành công!',
      });
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: res.message || 'Đã xảy ra lỗi.',
      });
    }
  } catch (error) {
    console.error('Yêu cầu thất bại:', error);
    context.setAlertBox({
      open: true,
      error: true,
      msg: 'Đã xảy ra lỗi trong quá trình gửi.',
    });
  } finally {
    setLoading(false);
    console.log('Hoàn thành gửi biểu mẫu');
  }
};


  return (
    <div className="right-content w-100">
      <div
        className="card shadow border-0 w-100 flex-row p-4"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h5 className="mb-0">Thêm danh mục con</h5>
        <BreadcrumbsNav />
      </div>
      <form onSubmit={handleSubmit} className="form">
        <div className="row">
          <div className="col-md-12">
            <div className="card mt-0 p-4 w-100">
              <CategoryForm
                formFields={formFields}
                handleInputChange={handleInputChange}
                formErrors={formErrors}
                bgColor={bgColor}
                isShowCatPage={true}
                catData={catData}
                handleSelectChange={handleSelectChange}
              />
            </div>
          </div>
        </div>
        <div className="card p-4 mt-0 w-100">
          <Button
            type="submit"
            className="btn-blue w-100 mt-5"
            disabled={loading}
          >
            {loading ? 'Đang xuất bản...' : 'XUẤT BẢN VÀ XEM'}
          </Button>
        </div>
      </form>
      <Backdrop
        sx={{
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={50} thickness={2} />
      </Backdrop>
    </div>
  );
};

export default AddSubcat;
