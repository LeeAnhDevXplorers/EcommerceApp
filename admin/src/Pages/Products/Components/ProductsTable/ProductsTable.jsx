import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { Link } from 'react-router-dom';

const ProductsTable = ({
  productList,
  loading,
  context,
  handleEditP,
  handleOpenDeleteDialog,
  isHomePage, 
}) => {
  return (
    <div className="table-responsive w-100 mt-5">
      <table className="table table-bordered v-align">
        <thead className="thead-dark">
          <tr>
            <th>UID</th>
            <th>SẢN PHẨM</th>
            <th>LOẠI</th>
            <th>PHÂN LOẠI</th>
            <th>THƯƠNG HIỆU</th>
            <th>GIÁ</th>
            <th>KHO</th>
            <th>ĐÁNH GIÁ</th>
            <th>HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          {productList?.length > 0 ? (
            productList?.map((item, index) => {
                const formattedPrice = parseFloat(item.price).toFixed(3);
              return (
                <tr key={item._id || index}>
                  <td>#{index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center productBox">
                      <div className="imgWrapper">
                        <div className="img">
                          <img
                            src={`${
                              item.images?.[1]?.replace(/\\/g, '/') ||
                              'defaultImage.jpg'
                            }`}
                            alt="Sản phẩm"
                            className="w-100"
                          />
                        </div>
                      </div>
                      <div className="info">
                        <h6>{item.name}</h6>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>{item.category.name}</td>
                  <td>{item.subCat?.subCat}</td>
                  <td>{item.brand}</td>
                  <td>
                    <del className="old tex">{item.oldPrice}</del>
                    <span className="new text-danger">{formattedPrice}</span>
                  </td>
                  <td>{item.countInStock}</td>
                  <td>{item.rating}</td>
                  <td>
                    <div className="actions d-flex align-items-center">
                      <Link
                        to={`/product/producDetails/${item.id}`}
                        aria-label="Xem chi tiết sản phẩm"
                      >
                        <Button className="secondary" color="secondary">
                          <FaEye />
                        </Button>
                      </Link>
                      {isHomePage && (
                        <Button
                          className="success"
                          color="success"
                          aria-label="Chỉnh sửa sản phẩm"
                          onClick={() => handleEditP(item._id)}
                        >
                          <FaPencilAlt />
                        </Button>
                      )}

                      {isHomePage && (
                        <Button
                          className="error"
                          color="error"
                          aria-label="Xóa sản phẩm"
                          onClick={() => handleOpenDeleteDialog(item._id)}
                        >
                          <MdDelete />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                {loading ? 'Đang tải...' : 'Không tìm thấy sản phẩm'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
