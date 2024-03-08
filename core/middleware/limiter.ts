// Defines rate limiting middleware to prevent abuse of the API. This file could use the createRateLimiter function for different endpoints.

import rateLimit from 'express-rate-limit';

// Function to create a customized rate limiter
export const createRateLimiter = (maxRequests: number, windowMinutes: number) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: "Too many requests, please try again later.",
  });
};
