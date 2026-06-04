import express from "express";
import {protect} from "../../middleware/auth.middleware.js";
import {authorizeRoles} from "../../middleware/role.middleware.js";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
} from "./auth.controller.js";


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logoutUser);

router.get(
    "/admin",
    protect,
    authorizeRoles("Admin"),
    (req, res) => {
        res.json({  
            message: "Admin Access Granted",
        });
    }
);

export default router;