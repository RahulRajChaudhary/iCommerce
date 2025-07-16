
import express, {Router } from "express";
import { userRegistration, verifyUser } from "../controller/auth-controller";

const router: Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/user-verify', verifyUser);

export default router;