"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/me", auth_middleware_1.authMiddleware, (req, res) => {
    res.json({
        message: "Protected route accessed",
        userId: req.user?.id
    });
});
exports.default = router;
