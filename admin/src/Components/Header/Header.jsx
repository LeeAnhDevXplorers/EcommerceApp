import Logout from '@mui/icons-material/Logout';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useContext, useState } from 'react';
import { IoShieldHalf } from 'react-icons/io5';
import { RiMenuUnfold3Line2, RiMenuUnfold4Line2 } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { assets } from '../../assets/assets';
import SearchBox from '../SearchBox/SearchBox';
import './Header.css';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenNotifyDrop, setisOpenNotifyDrop] = useState(null);
  const openMyacc = Boolean(anchorEl);
  const openNotify = Boolean(isOpenNotifyDrop);
  const context = useContext(MyContext);
  const navigate = useNavigate()
  const handleOpenMyAccDrop = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleOpenNotifyDrop = (event) => {
    setisOpenNotifyDrop(event.currentTarget);
  };

  const handleClMyAccDrop = () => {
    setAnchorEl(null);
  };

  const handleClNotifyDrop = () => {
    setisOpenNotifyDrop(null);
  };

  const logout = () => {
    localStorage.clear();
    setAnchorEl(null)
    setTimeout(() => {
      navigate("/login")
    }, 1000);
  };

  return (
    <header className="d-flex align-items-center">
      <div className="container-fluid w-100">
        <div className="row d-flex align-items-center w-100">
          <div className="col-sm-2 part1">
            <Link to={'/'} className="d-flex align-items-center logo">
              <img src={assets.logo} alt="Great Stack Logo" />
              <span className="ml-2">Great Stack</span>
            </Link>
          </div>
          <div className="col-xs-3 d-flex align-items-center part2 pl-4">
            <Button
              className="rounded-circle mr-3"
              onClick={() =>
                context.setisToggleSiderBar(!context.isToggleSiderBar)
              }
            >
              {context.isToggleSiderBar === false ? (
                <RiMenuUnfold4Line2 />
              ) : (
                <RiMenuUnfold3Line2 />
              )}
            </Button>
            <SearchBox />
          </div>
          <div className="col-sm-7 d-flex align-items-center justify-content-end part3 ml-auto">
            {context.isLogin !== true ? (
              <Button className="btn-blue btn-lg btn-round text-white">
                <Link to={'/login'}>Sign In</Link>
              </Button>
            ) : (
              <div className="myAccWrapper">
                <Button
                  className="myAcc d-flex align-items-center"
                  onClick={handleOpenMyAccDrop}
                >
                  <div className="userImg">
                    <span className="rounded-circle">
                      {context.user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="userInfo">
                    <h4>{context.user?.name}</h4>
                    <p className="mb-0">{context.user?.email}</p>
                  </div>
                </Button>
                <Menu
                  sx={{ marginTop: '15px' }}
                  anchorEl={anchorEl}
                  className="dropdow_list"
                  id="account-menu"
                  open={openMyacc}
                  onClose={handleClMyAccDrop}
                  onClick={handleClMyAccDrop}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem
                    sx={{ fontSize: '1.5rem' }}
                    onClick={handleClMyAccDrop}
                  >
                    <ListItemIcon>
                      <PersonAdd fontSize="small" />
                    </ListItemIcon>
                    Tài khoản của bạn
                  </MenuItem>
                  <MenuItem
                    sx={{ fontSize: '1.5rem' }}
                    onClick={handleClMyAccDrop}
                  >
                    <ListItemIcon>
                      <IoShieldHalf fontSize="small" />
                    </ListItemIcon>
                   Đổi mật khẩu
                  </MenuItem>
                  <MenuItem sx={{ fontSize: '1.5rem' }} onClick={logout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
