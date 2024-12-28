import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import pLimit from 'p-limit';
import { Category } from '../models/categories.js';

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key, 
  api_secret: process.env.cloudinary_Config_api_secret,
});
 
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
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
            // Clean up locally saved file after successful upload
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
router.post('/upload', upload.array('images'), async (req, res) => {
  const uploadedFiles = req.files.map((file) => file.filename);
  const cloudinaryUploadResults = await uploadImages(req.files);
  res.json({ uploadedFiles, cloudinaryUploadResults });
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 20;
    const totalPosts = await Category.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res.status(404).json({ message: 'Không tìm thấy trang' });
    }

    const categoryList = await Category.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    if (!categoryList) {
      res.status(500).json({ success: false });
    }
    return res.status(200).json({
      categoryList: categoryList,
      totalPages: totalPages,
      page: page, 
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        message: 'Không tìm thấy danh mục có id đã cho',
      });
    }
    return res.status(200).send(category);
  } catch (err) {
    res.status(500).json({
      message: 'Đã xảy ra lỗi trong khi tìm kiếm danh mục',
      error: err.message,
    });
  }
});

// Route tạo mới category với ảnh, giữ lại file trong thư mục 'uploads'
router.post('/create', upload.array('images'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No images provided!',
        success: false,
      }); 
    }

    // Upload ảnh lên Cloudinary mà không xóa ảnh trong thư mục 'uploads'
    const uploadStatus = await uploadImages(req.files);

    // Lấy URL của ảnh đã upload lên Cloudinary
    const imgUrls = uploadStatus.map((item) => item.url);
    let category = new Category({
      name: req.body.name,
      color: req.body.color,
      images: imgUrls,
    });

    category = await category.save();

    return res.status(201).json({
      message: 'Category created successfully',
      category,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Internal server error',
      success: false,
    });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục', success: false });
    }

    const deletionPromises = category.images.map((image) => {
      const publicId = image.split('/').pop().split('.')[0]; 
      return cloudinary.uploader.destroy(publicId).catch((error) => {
        console.error('Lỗi xóa ảnh từ Cloudinary:', error.message);
        return null;
      });
    });
    await Promise.all(deletionPromises);

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa danh mục và ảnh thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi xóa danh mục và ảnh', error: err.message });
  }
});

router.put('/:id', upload.array('images'), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục', success: false });
    }

    const newImages = req.files || [];
    if (newImages.length > 0) {
      await deleteCloudinaryImages(existingCategory.images);
      const uploadResults = await uploadImages(newImages);
      existingCategory.images = uploadResults.map((result) => result.url);
    }

    existingCategory.name = req.body.name;
    existingCategory.color = req.body.color;

    const updatedCategory = await existingCategory.save();
    res.status(200).json({ message: 'Cập nhật danh mục thành công', category: updatedCategory, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật danh mục', success: false, error: error.message });
  }
});

router.delete("/delete-image", async (req, res) => {
  const { publicId, categoryId } = req.body; 
  if (!publicId || !categoryId) {
    return res
      .status(400)
      .json({ success: false, message: "publicId and categoryId are required" });
  }

  try {
    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      return res
        .status(400)
        .json({ success: false, message: "Failed to delete image from Cloudinary" });
    }

    // Delete image reference from MongoDB
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    category.images = category.images.filter(image => image.publicId !== publicId);
    await category.save();

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
