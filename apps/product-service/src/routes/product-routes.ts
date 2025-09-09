
import express, { Router } from "express";
import { createDiscountCodes, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getAllEvents, getAllProducts, getCategories, getDiscountCodes, getFilteredEvents, getFilteredProducts, getFilteredShops, getProductAnalytics, getProductDetails, getShopProducts, restoreProduct, searchProducts, slugValidator, topShops, uploadProductImage } from "../controllers/product-controllers";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSeller } from "../../../../packages/middleware/authorizeRole";


const router:Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);
router.post("/create-product", isAuthenticated, createProduct);
router.get("/get-shop-products", isAuthenticated, getShopProducts);
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);
router.get("/get-all-products", getAllProducts);
router.get("/get-all-events", getAllEvents);
router.get("/get-product/:slug", getProductDetails);
router.get("/get-filtered-products", getFilteredProducts);
router.get("/get-filtered-offers", getFilteredEvents);
router.get("/get-filtered-shops", getFilteredShops);
router.get("/search-products", searchProducts);
router.get("/top-shops", topShops);
router.post("/slug-validator", isAuthenticated, isSeller, slugValidator);
router.get("/get-product-analytics/:productId", getProductAnalytics);


export default router;