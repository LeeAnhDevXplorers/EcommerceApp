import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import React, { useContext, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
import { RiMenu2Fill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { MyContext } from "../../../App";
import "./Navigation.css";
const Navigation = (props) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const context = useContext(MyContext);
  const [isopenSidebarVal, setisopenSidebarVal] = useState(false);
  return (
    <nav>
      <div className="container">
        <div className="row">
          <div className="col-sm-2 navPart1">
            <div className="catWrapper">
              <Button
                className="allCatTab align-items-center"
                onClick={() => setisopenSidebarVal(!isopenSidebarVal)}
              >
                <span className="icon1 mr-2">
                  <RiMenu2Fill />
                </span>
                <span className="text">Tất cả danh mục</span>
                <span className="icon2 ml-2">
                  <FaAngleDown />
                </span>
              </Button>
              <div
                className={`sidebarNav ${
                  isopenSidebarVal === true ? "open" : ""
                }`}
              >
                <ul>
                  {props.navData?.length !== 0 &&
                    props.navData?.map((item, index) => {
                      return (
                        <li key={index}>
                          <Link to="/">
                            <Button>
                              {item?.name} <FaAngleRight className="ml-auto" />
                            </Button>
                          </Link>
                          <div className="submenu">
                            {context.subCatData?.length !== 0 &&
                              context.subCatData?.map((item, index) => {
                                return (
                                  <Link to="" key={index}>
                                    <Button>{item.subCat}</Button>
                                  </Link>
                                );
                              })}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          </div>
          <div className="col-sm-10 navPart2 d-flex align-items-center">
            <Link to="/" style={{fontSize: "1.6rem", color: "#000", fontWeight: 500, marginRight: "20px"}}>Home</Link>
            <Link to="/shops" style={{fontSize: "1.6rem", color: "#000", fontWeight: 500}}>Shop</Link>
            <Box
              sx={{
                flexGrow: 1,
                maxWidth: { xs: 200, sm: 800 },
                bgcolor: "background.paper",
              }}
              className="ml-auto"
            >
              <Tabs
                onChange={handleChange}
                value={value}
                variant="scrollable"
                scrollButtons
                aria-label="visible arrows tabs example"
                sx={{
                  [`& .${tabsClasses.scrollButtons}`]: {
                    "&.Mui-disabled": { opacity: 0.3 },
                  },
                }}
              >
                {context.subCatData?.length !== 0 &&
                  context.subCatData?.map((item, index) => {
                    return (
                      <Tab
                        label={item.subCat}
                        href={`/subCat/${item?.id}`}
                        key={index}
                      />
                    );
                  })}
              </Tabs>
            </Box>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
