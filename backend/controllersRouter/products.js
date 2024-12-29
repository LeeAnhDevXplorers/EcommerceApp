import { v2 as cloudinary } from "cloudinary";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import multer from "multer";
import pLimit from "p-limit";
import { ProductWeigth } from "../models/productWeigths.js";
import { Products } from "../models/products.js";
import { ProductRams } from "../models/productsRams.js";
import { ProductSize } from "../models/productsSize.js";
import { ProductReviews } from "../models/productReviews.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
});

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {  
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Utility function for uploading images to Cloudinary with concurrency limit
const uploadImages = async (images) => {
  const limit = pLimit(2); // Set a limit for concurrent uploads
  const uploadStatus = await Promise.all(
    images.map((image) =>
      limit(() =>
        cloudinary.uploader
          .upload(image.path)
          .then((result) => {
            fs.unlinkSync(image.path); // Delete the file after uploading
            return {
              success: true,
              url: result.url,
              publicId: result.public_id,
            };
          })
          .catch((error) => {
            return { success: false, error };
          })
      )
    )
  );
  return uploadStatus;
};

// Route to upload images locally, then upload to Cloudinary
router.post("/upload", upload.array("images"), async (req, res) => {
  const uploadedFiles = req.files.map((file) => file.filename);
  const cloudinaryUploadResults = await uploadImages(req.files);
  res.json({ uploadedFiles, cloudinaryUploadResults });
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;

    const filter = {};
    const { subName, catName, minPrice, maxPrice, location, subCatId } = req.query;

    if (subName) filter.subName = subName;
    if (catName) filter.catName = catName;
    if (subCatId) filter.subCat = subCatId; // Filter by subcategory if provided

    if (minPrice) filter.price = { ...filter.price, $gte: parseInt(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseInt(maxPrice) };

    if (location && location !== "All") filter.location = location;

    const totalPosts = await Products.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages > 0) {
      return res.status(404).json({ message: "Không tìm thấy trang" });
    }

    const productList = await Products.find(filter)
      .populate("category subCat weightName ramName sizeName")
      .skip((page - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      data: productList,
      totalPages,
      page,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", error });
  }
});


router.get("/featured", async (req, res) => {
  let productList;

  if (
    req.query.location !== undefined &&
    req.query.location !== null &&
    req.query.location !== "All"
  ) {
    productList = await Products.find({
      isFeatured: true,
      location: req.query.location,
    });
  } else {
    productList = await Products.find({
      isFeatured: true,
    });
  }
  if (!productList || productList.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No featured products found." });
  }

  return res.status(200).json({ success: true, data: productList });
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id).populate([
      "category",
      "subCat",
      "weightName",
      "ramName",
      "sizeName",
    ]);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy thông tin sản phẩm",
      error: error.message,
    });
  }
});

router.get("/:id/ratings-comments", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const reviews = await ProductReviews.find({ productId: id });
    const totalReviews = reviews.length;
    const totalStars = reviews.reduce((acc, review) => acc + review.customerRating, 0);

    const starPercentage = totalReviews ? (totalStars / (totalReviews * 5)) * 100 : 0;
    const commentPercentage = totalReviews ? (totalReviews / totalReviews) * 100 : 0;

    res.status(200).json({
      starPercentage,
      commentPercentage,
      totalReviews,
      totalStars,
    });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tính toán đánh giá và bình luận",
      error: error.message,
    });
  }
});

router.post("/create", upload.array("images"), async (req, res) => {
  try {
    const imgUrls = (await uploadImages(req.files))
      .filter((item) => item.success)
      .map((item) => item.url);

    if (!imgUrls.length) {
      return res.status(500).json({
        success: false,
        message: "Tải hình ảnh thất bại.",
      });
    }

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
      isFeatured = false,
      location,
    } = req.body;

    if (
      !mongoose.isValidObjectId(category) ||
      !mongoose.isValidObjectId(subCat)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID danh mục hoặc danh mục con không hợp lệ.",
      });
    }

    const weightIds = weightName
      ? (
          await ProductWeigth.find({
            weightName: { $in: weightName.split(",") },
          })
        ).map((doc) => doc._id)
      : [];

    const ramIds = ramName
      ? (await ProductRams.find({ ramName: { $in: ramName.split(",") } })).map(
          (doc) => doc._id
        )
      : [];

    const sizeIds = sizeName
      ? (
          await ProductSize.find({ sizeName: { $in: sizeName.split(",") } })
        ).map((doc) => doc._id)
      : [];

    const newProduct = new Products({
      name,
      description,
      images: imgUrls,
      brand,
      oldPrice,
      price: oldPrice * (1 - discount / 100),
      category,
      subCat,
      catName,
      subName,
      countInStock,
      discount,
      weightName: weightIds,
      ramName: ramIds,
      sizeName: sizeIds,
      isFeatured,
      location,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công.",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ.",
      error: error.message,
    });
  }
});


router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm." });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Yêu cầu chọn ảnh mới." });
    }

    for (const image of product.images) {
      const publicId = image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const uploadStatus = await uploadImages(req.files);
    const uploadedImages = uploadStatus
      .filter((item) => item.success)
      .map((item) => item.url);

    if (uploadedImages.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: "Tải ảnh lên thất bại." });
    }

    const updateData = {
      ...product._doc,
      ...req.body,
      images: uploadedImages,
      weightName: req.body.weightName
        ? req.body.weightName.split(",")
        : product.weightName,
      ramName: req.body.ramName ? req.body.ramName.split(",") : product.ramName,
      sizeName: req.body.sizeName
        ? req.body.sizeName.split(",")
        : product.sizeName,
    };

    if (
      updateData.oldPrice &&
      updateData.discount >= 0 &&
      updateData.discount <= 100
    ) {
      updateData.price =
        updateData.oldPrice - (updateData.oldPrice * updateData.discount) / 100;
    }

    const updatedProduct = await Products.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật sản phẩm thành công.",
        product: updatedProduct,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ.", error: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để xóa" });
    }

    await Promise.all(
      product.images.map(async (image) => {
        const publicId = image.split("/").pop().split(".")[0];
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error(
              "Lỗi khi xóa hình ảnh trên Cloudinary:",
              error.message
            );
          }
        }
      })
    );

    await Products.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
});

router.delete("/delete-image", async (req, res) => {
  const { publicId } = req.body; 
  if (!publicId) {
    return res
      .status(400)
      .json({ success: false, message: "publicId is required" });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to delete image" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
