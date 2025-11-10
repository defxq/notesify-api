import express from "express";
const router = express.Router();
import authController from "./controllers/authController.js";
import loginLimiter from "../../middlewares/loginLimiter.js";

router.route("/")
    .post(loginLimiter, authController.login);

router.route("/refresh")
    .get(authController.refresh);

router.route("/logout")
    .post(authController.logout);

export default router;