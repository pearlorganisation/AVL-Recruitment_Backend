import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    verifyEmail,
    getMe,
} from "./auth.controller.js";


const router = express.Router();

router.post("/register", registerUser);

router.get("/verify-email/:token",verifyEmail);

router.post("/login", loginUser);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout",protect,logoutUser);

router.get("/me", protect, getMe);

router.get(
    "/admin",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({
            message: "Admin Access Granted",
        });
    }
);

export default router;