"use strict";
// Defines rate limiting middleware to prevent abuse of the API. This file could use the createRateLimiter function for different endpoints.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Function to create a customized rate limiter
const createRateLimiter = (maxRequests, windowMinutes) => {
    return (0, express_rate_limit_1.default)({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        message: "Too many requests, please try again later.",
    });
};
exports.createRateLimiter = createRateLimiter;
