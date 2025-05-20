"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/me', authMiddleware_1.protect, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.user });
});
exports.default = router;
