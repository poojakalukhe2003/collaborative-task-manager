"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = async (name, email, password) => {
    const existingUser = await client_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await client_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await client_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
};
exports.loginUser = loginUser;
