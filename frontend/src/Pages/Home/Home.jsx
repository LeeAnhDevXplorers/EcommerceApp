import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React, { useContext, useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MyContext } from "../../App";
import HomeBanner from "../../Components/HomeBanner/HomeBanner";
import HomeCat from "../../Components/HomeCat/HomeCat";
import ProductItem from "../../Components/ProductItem/ProductItem";
import { assets } from "../../assets/assets";
import "./Home.css";

import { IoMailOutline } from "react-icons/io5";
import { fetchDataFromApi } from "../../utils/api";
const Home = () => {
  const [catData, setCatData] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [subCatData, setSubCatData] = useState([]);
  const [featuredProducts, setfeaturedProducuts] = useState([]);
  const [productsData, setProducutsData] = useState([]);
  const [value, setValue] = React.useState(0);
  const context = useContext(MyContext);
  const [fashionData, setFashionData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectCat = (cat) => {
    setSelectedCat(cat);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Bắt đầu tải dữ liệu

        const [categoryData, subCategoryData] = await Promise.all([
          fetchDataFromApi("/api/category"),
          fetchDataFromApi("/api/subCategory"),
        ]);

        setCatData(categoryData);
        setSubCatData(subCategoryData);

        const location = localStorage.getItem("location");
        if (location) {
          const [featuredProductsData, productsData] = await Promise.all([
            fetchDataFromApi(`/api/products/featured?location=${location}`),
            fetchDataFromApi(`/api/products?location=${location}`),
          ]);

          setfeaturedProducuts(featuredProductsData.data);
          setProducutsData(productsData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
      } finally {
        setLoading(false); // Kết thúc việc tải dữ liệu
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (catData?.length > 0) {
      setSelectedCat(catData[0]?.name);
    }
  }, [catData]);

  useEffect(() => {
    const location = localStorage.getItem("location");
    if (location !== null && location !== "" && location !== undefined) {
      fetchDataFromApi(
        `/api/products?catName=${selectedCat}&location=${location}`
      )
        .then((res) => {
          setFilterData(res.data);
        })
        .catch((error) => {});
    }
  }, [selectedCat]);

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <div>
      <HomeBanner />
      {catData?.length !== 0 && (
        <HomeCat catData={catData} subCatData={subCatData} />
      )}

      <section className="homeProducts">
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <div className="sticky">
                <div className="banner">
                  <img
                    src={assets.product_banner}
                    alt=""
                    className="cursor w-100"
                  />
                </div>

                <div className="banner mt-3">
                  <img
                    src={assets.product_banner2}
                    alt=""
                    className="cursor w-100"
                  />
                </div>
              </div>
            </div>
            <div className="col-md-9 homeProductRow">
              <div className="d-flex align-items-center">
                <div className="info w-75">
                  <h3 className="mb-0 hd">Sản phẩm phổ biến</h3>
                  <p className="text-light text-sml mb-0">
                    Đừng bỏ lỡ các ưu đãi hiện tại cho đến cuối tháng 3.
                  </p>
                </div>
                <div className="ml-auto">
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                    className="filter-tabs"
                  >
                    {context.catData?.length > 0 &&
                      context.catData.map((item, index) => (
                        <Tab
                          onClick={() => selectCat(item.name)}
                          className="filter-item"
                          key={index}
                          label={item.name}
                        />
                      ))}
                  </Tabs>
                </div>
              </div>
              <div className="product-row mt-4 w-100">
                {filterData?.length === 0 ? (
                  <p>Không có sản phẩm nào có sẵn trong danh mục này.</p>
                ) : (
                  <Swiper
                    slidesPerView={4}
                    spaceBetween={0}
                    navigation={true}
                    pagination={{
                      clickable: true,
                    }}
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {filterData.map((item, index) => (
                      <SwiperSlide className="mr-2" key={index}>
                        <ProductItem item={item} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>

              <div className="d-flex align-items-center mt-5">
                <div className="info w-75">
                  <h3 className="mb-0 hd">SẢN PHẨM MỚI</h3>
                  <p className="text-light text-sml mb-0">
                    Sản phẩm mới với số lượng hàng cập nhật.
                  </p>
                </div>
                <Button className="viewAllBtn ml-auto">
                  Xem tất cả <FaArrowRight />
                </Button>
              </div>
              <div className="product-row productRow2 mt-4 w-100 d-flex">
                {productsData?.data?.length !== 0 &&
                  productsData?.data?.map((item, index) => {
                    return <ProductItem key={index} item={item} />;
                  })}
              </div>
              <div className="d-flex mt-4 mb-5 bannerSec">
                <div className="banner">
                  <img src={assets.banner1} alt="" />
                </div>
                <div className="banner">
                  <img src={assets.banner2} alt="" />
                </div>
              </div>
            </div>
          </div>
          <div className="homeProductRow mt-3">
            <div className="d-flex align-items-center">
              <div className="info w-75">
                <h3 className="mb-0 hd mt-4">BÁN CHẠY NHẤT</h3>
                <p className="text-light text-sml mb-0">
                  Đừng bỏ lỡ các ưu đãi hiện tại cho đến cuối tháng 3.
                </p>
              </div>
              <Button className="viewAllBtn ml-auto">
                Xem tất cả <FaArrowRight />
              </Button>
            </div>
            <div className="product-row mt-4 w-100">
              <Swiper
                slidesPerView={4}
                spaceBetween={0}
                navigation={true}
                pagination={{
                  clickable: true,
                }}
                modules={[Navigation]}
                className="mySwiper"
              >
                {featuredProducts?.map((item, index) => {
                  return (
                    <SwiperSlide className="mr-2" key={index}>
                      <ProductItem item={item} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      <section className="newsLetterSection mt-3 mb-3 d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p className="text-white mb-1">
                Giảm giá 20$ cho đơn hàng đầu tiên của bạn
              </p>
              <h3 className="text-white">
                Tham gia bản tin của chúng tôi và nhận...
              </h3>
              <p className="text-light">
                Tham gia đăng ký email của chúng tôi <br /> ngay để nhận thông
                tin cập nhật về chương trình khuyến mãi và phiếu giảm giá.
              </p>

              <form>
                <IoMailOutline />
                <input type="text" placeholder="Địa chỉ Email của bạn" />
                <Button>Đặt mua</Button>
              </form>
            </div>
            <div className="col-md-6">
              <img src={assets.newsLetterImg} alt="" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
