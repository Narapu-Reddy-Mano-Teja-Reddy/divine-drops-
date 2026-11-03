import { Router } from "express";
import multer from "multer";
import {
  customers,
  dashboard,
  inventory,
} from "../controllers/adminController";
import { login, me, register } from "../controllers/authController";
import {
  createBlog,
  deleteBlog,
  getBlog,
  listBlogs,
  listReviews,
  settings,
  subscribe,
  updateBlog,
} from "../controllers/blogController";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/categoryController";
import {
  createOrder,
  exportOrdersCsv,
  getAdminOrder,
  getOrderByNumber,
  listAdminOrders,
  updateOrderNotes,
  updateOrderStatus,
} from "../controllers/orderController";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/productController";
import { uploadImage } from "../controllers/uploadController";
import { authenticate, requireAdmin } from "../middleware/auth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", authenticate, me);

router.get("/products", listProducts);
router.get("/products/:id", getProduct);

router.get("/categories", listCategories);

router.post("/orders", createOrder);
router.get("/orders/:orderNumber", getOrderByNumber);

router.get("/blogs", listBlogs);
router.get("/blogs/:id", getBlog);
router.get("/reviews", listReviews);
router.post("/newsletter", subscribe);
router.get("/settings", settings);

const admin = Router();
admin.use(authenticate, requireAdmin);

admin.get("/dashboard", dashboard);
admin.get("/inventory", inventory);
admin.get("/customers", customers);

admin.post("/products", createProduct);
admin.put("/products/:id", updateProduct);
admin.delete("/products/:id", deleteProduct);

admin.post("/categories", createCategory);
admin.put("/categories/:id", updateCategory);
admin.delete("/categories/:id", deleteCategory);

admin.get("/orders", listAdminOrders);
admin.get("/orders/export/csv", exportOrdersCsv);
admin.get("/orders/:id", getAdminOrder);
admin.patch("/orders/:id/status", updateOrderStatus);
admin.patch("/orders/:id/notes", updateOrderNotes);

admin.post("/blogs", createBlog);
admin.put("/blogs/:id", updateBlog);
admin.delete("/blogs/:id", deleteBlog);

admin.post("/uploads", upload.single("image"), uploadImage);

router.use("/admin", admin);
