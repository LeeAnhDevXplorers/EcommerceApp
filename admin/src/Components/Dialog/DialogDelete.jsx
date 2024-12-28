import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

const ProductDeleteDialog = ({ open, onClose, onDelete }) => {
  console.log('Trạng thái mở hộp thoại xóa:', open); 

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Bạn có chắc chắn muốn xóa sản phẩm này không?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Hủy
        </Button>
        <Button onClick={onDelete} color="error" autoFocus>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDeleteDialog;
