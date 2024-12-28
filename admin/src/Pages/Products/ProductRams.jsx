import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import {
  Backdrop,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';

import { MdDelete } from 'react-icons/md';

import { emphasize, styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { MyContext } from '../../App';
import { deleteData, fetchDataFromApi, postData } from '../../utils/api';
import DeleteDialog from '../Category/Components/DeleteDialog/DeleteDialog';

const StyleBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const ProductRams = () => {
  const [pRamData, setPRamData] = useState([]);
  const [deleteType, setDeleteType] = useState('');
  const [pWeigthData, setPWeigthData] = useState([]);
  const [pSizeData, setPSizeData] = useState([]);
  const [formFieldsrRam, setFormFieldsRam] = useState({ ramName: '' });
  const [formFieldsrWeigth, setFormFieldsWeigth] = useState({ weightName: '' });
  const [formFieldsrSize, setFormFieldsSize] = useState({ sizeName: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteID, setDeleteID] = useState(null);

  const navigate = useNavigate();
  const context = useContext(MyContext);

  useEffect(() => {
    fetchDataFromApi('/api/prams').then((res) => setPRamData(res.data));
    fetchDataFromApi('/api/weight').then((res) => setPWeigthData(res.data));
    fetchDataFromApi('/api/psize').then((res) => setPSizeData(res.data));
  }, []);

  useEffect(() => {
    console.log('formFieldsrRam changed:', formFieldsrRam);
  }, [formFieldsrRam]);

  const validateForm = (type) => {
    const formErrors = {};

    if (type === 'ram' && !formFieldsrRam.ramName)
      formErrors.ramName = 'Tên RAM là bắt buộc';
    if (type === 'weight' && !formFieldsrWeigth.weightName)
      formErrors.weightName = 'Tên trọng lượng là bắt buộc';
    if (type === 'size' && !formFieldsrSize.sizeName)
      formErrors.sizeName = 'Tên kích thước là bắt buộc';

    setErrors(formErrors);

    return Object.keys(formErrors).length === 0;
  };

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      return updated;
    });
  };
  const handleSubmitRam = async (e) => {
    e.preventDefault();
    if (validateForm('ram')) {
      setLoading(true);
      try {
        const data = {
          ramName: formFieldsrRam.ramName,
        };

        console.log('Sending data:', data);

        const res = await postData('/api/prams/create', data);

        console.log('Response:', res);

        if (res.success) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          setFormFieldsRam({ ramName: '' });

          context.setAlertBox({
            open: true,
            error: false,
            msg: 'Danh mục đã được tạo thành công!',
          });
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.message || 'Đã xảy ra lỗi.',
          });
        }
      } catch (error) {
        console.error('Submit error:', error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: 'Đã xảy ra lỗi trong quá trình gửi.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log('RAM form has errors.');
    }
  };

  const handleSubmitWeigth = async (e) => {
    e.preventDefault();
    if (validateForm('weight')) {
      setLoading(true);
      try {
        const data = { weightName: formFieldsrWeigth.weightName };
        const res = await postData('/api/weight/create', data);
        if (res.success) {
          setFormFieldsWeigth({ weightName: '' });
          context.setAlertBox({
            open: true,
            error: false,
            msg: 'Danh mục trọng lượng đã được tạo thành công!',
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.message || 'Đã xảy ra lỗi.',
          });
        }
      } catch (error) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: 'Đã xảy ra lỗi trong quá trình gửi.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Weight form has errors.');
    }
  };

  const handleSubmitSize = async (e) => {
    e.preventDefault();
    if (validateForm('size')) {
      setLoading(true);
      try {
        const data = { sizeName: formFieldsrSize.sizeName };
        const res = await postData('/api/psize/create', data);
        if (res.success) {
          setFormFieldsSize({ sizeName: '' });
          context.setAlertBox({
            open: true,
            error: false,
            msg: 'Danh mục kích thước đã được tạo thành công!',
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.message || 'Đã xảy ra lỗi.',
          });
        }
      } catch (error) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: 'Đã xảy ra lỗi trong quá trình gửi.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Size form has errors.');
    }
  };

 const handleDeleteRams = async (id) => {
   context.setProgress(30); 

   try {
     await deleteData(`/api/prams/${id}`);
     context.setProgress(70);
     context.setProgress(100); 
     window.location.reload(); 
   } catch (error) {
     console.error('Failed to delete category:', error);
     context.setProgress(0); 
   }
 };

 const handleDeleteWeight = async (id) => {
   context.setProgress(30); 

   try {
     await deleteData(`/api/weight/${id}`); 
     context.setProgress(70);
     context.setProgress(100); 
     window.location.reload(); 
   } catch (error) {
     console.error('Failed to delete category:', error);
     context.setProgress(0); 
   }
 };

 const handleDeleteSize = async (id) => {
   context.setProgress(30); 

   try {
     await deleteData(`/api/psize/${id}`); 
     context.setProgress(70);
     context.setProgress(100); 
     window.location.reload(); 
   } catch (error) {
     console.error('Failed to delete category:', error);
     context.setProgress(0); 
   }
 };

  return (
    <div>
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
        <div className="row">
          <div className="col">
            <div className="form-group">
              <form onSubmit={handleSubmitWeigth} className="form">
                <div className="row">
                  <div className="col-md-12">
                    <div className="card mt-0 p-4 w-100">
                      <TextField
                        label="Tên trọng lượng"
                        variant="outlined"
                        type="text"
                        name="weightName"
                        id="weightName"
                        value={formFieldsrWeigth.weightName || ''} 
                        onChange={(e) =>
                          handleInputChange(e, setFormFieldsWeigth)
                        }
                      />
                      {errors.weightName && (
                        <div
                          style={{ fontSize: '1.4rem' }}
                          className="text-danger"
                        >
                          {errors.weightName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card p-4 mt-0 w-100">
                  <Button
                    type="submit"
                    className="btn-blue w-100 mt-5"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'THÊM'}
                  </Button>
                </div>
              </form>
            </div>
            <div
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '10px',
              }}
              className="table-responsive w-100 mt-5"
            >
              <table className="table table-bordered v-align">
                <thead className="thead-dark">
                  <tr>
                    <th>UID</th>
                    <th>Tên</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {pWeigthData.map((item, index) => {
                    return (
                      <tr key={item._id || index}>
                        <td>#{index + 1}</td>
                        <td>{item.weightName}</td>
                        <td>
                          <div className="actions d-flex align-items-center">
                            <Button
                              className="error"
                              color="error"
                              aria-label="Xóa sản phẩm"
                              onClick={() => handleDeleteWeight(item._id)}
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <form onSubmit={handleSubmitSize} className="form">
                <div className="row">
                  <div className="col-md-12">
                    <div className="card mt-0 p-4 w-100">
                      <TextField
                        label="Tên kích thước"
                        variant="outlined"
                        type="text"
                        name="sizeName"
                        id="sizeName"
                        value={formFieldsrSize.sizeName || ''}
                        onChange={(e) =>
                          handleInputChange(e, setFormFieldsSize)
                        }
                      />
                      {errors.sizeName && (
                        <div
                          style={{ fontSize: '1.4rem' }}
                          className="text-danger"
                        >
                          {errors.sizeName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card p-4 mt-0 w-100">
                  <Button
                    type="submit"
                    className="btn-blue w-100 mt-5"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'THÊM'}
                  </Button>
                </div>
              </form>
            </div>
            <div
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '10px',
              }}
              className="table-responsive w-100 mt-5"
            >
              <table className="table table-bordered v-align">
                <thead className="thead-dark">
                  <tr>
                    <th>UID</th>
                    <th>Tên</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {pSizeData.map((item, index) => {
                    return (
                      <tr key={item._id || index}>
                        <td>#{index + 1}</td>
                        <td>{item.sizeName}</td>
                        <td>
                          <div className="actions d-flex align-items-center">
                            <Button
                              className="error"
                              color="error"
                              aria-label="Xóa sản phẩm"
                              onClick={() => handleDeleteSize(item._id)}
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col">
            <div className="form-group">
              <form onSubmit={handleSubmitRam} className="form">
                <div className="row">
                  <div className="col-md-12">
                    <div className="card mt-0 p-4 w-100">
                      <TextField
                        label="Tên RAM"
                        variant="outlined"
                        type="text"
                        name="ramName"
                        id="ramName"
                        value={formFieldsrRam.ramName || ''} 
                        onChange={(e) => handleInputChange(e, setFormFieldsRam)}
                      />
                      {errors.ramName && (
                        <div
                          style={{ fontSize: '1.4rem' }}
                          className="text-danger"
                        >
                          {errors.ramName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card p-4 mt-0 w-100">
                  <Button
                    type="submit"
                    className="btn-blue w-100 mt-5"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'THÊM'}
                  </Button>
                </div>
              </form>
            </div>
            <div
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '10px',
              }}
              className="table-responsive w-100 mt-5"
            >
              <table className="table table-bordered v-align">
                <thead className="thead-dark">
                  <tr>
                    <th>UID</th>
                    <th>Tên</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {pRamData.map((item, index) => {
                    return (
                      <tr key={item._id || index}>
                        <td>#{index + 1}</td>
                        <td>{item.ramName}</td>
                        <td>
                          <div className="actions d-flex align-items-center">
                            <Button
                              className="error"
                              color="error"
                              aria-label="Xóa sản phẩm"
                              onClick={() => handleDeleteRams(item._id)}
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRams;
