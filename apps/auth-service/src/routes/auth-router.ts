
import express, { Router } from "express";
import { getUser, loginUser, refereshToken, resetUserPassword, userForgotPassword, userRegistration, verifyForgotPassword, verifyUser } from "../controller/auth-controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/refresh-token-user', refereshToken);
router.get('/loggedin-user', isAuthenticated, getUser);
router.post('/forgot-password-user', userForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/verify-forgot-password-user', verifyForgotPassword);

export default router;