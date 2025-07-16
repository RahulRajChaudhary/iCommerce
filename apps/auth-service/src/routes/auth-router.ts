
import express, {Router } from "express";
import { loginUser, userRegistration, verifyUser } from "../controller/auth-controller";

const router: Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/user-verify', verifyUser);
router.post('/user-login', loginUser);

export default router;