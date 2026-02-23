const axios = require('axios');

/**
 * Verify Google reCAPTCHA v2/v3
 * @param {string} token - reCAPTCHA token from client
 * @param {string} remoteip - User's IP address (optional)
 * @returns {Promise<Object>}
 */
const verifyCaptcha = async (token, remoteip = null) => {
    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        if (!secretKey) {
            console.error('reCAPTCHA secret key not configured');
            // Fail open for development if needed, or secure fail
            return {
                success: false,
                message: 'CAPTCHA verification not configured'
            };
        }

        if (!token) {
            return {
                success: false,
                message: 'CAPTCHA token is required'
            };
        }

        const params = new URLSearchParams();
        params.append('secret', secretKey);
        params.append('response', token);
        if (remoteip) {
            params.append('remoteip', remoteip);
        }

        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { success, score, action, 'error-codes': errorCodes } = response.data;

        if (!success) {
            return {
                success: false,
                message: 'CAPTCHA verification failed',
                errors: errorCodes
            };
        }

        // For reCAPTCHA v3, check score (0.0 - 1.0, higher is better)
        if (score !== undefined) {
            if (score < 0.5) {
                return {
                    success: false,
                    message: 'CAPTCHA score too low',
                    score
                };
            }
        }

        return {
            success: true,
            message: 'CAPTCHA verified successfully',
            score,
            action
        };
    } catch (error) {
        console.error('CAPTCHA verification error:', error.message);
        return {
            success: false,
            message: 'CAPTCHA verification failed',
            error: error.message
        };
    }
};

/**
 * Middleware to verify CAPTCHA before processing request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const captchaMiddleware = async (req, res, next) => {
    try {
        const { captchaToken } = req.body;

        // Skip if disabled via env (optional)
        if (process.env.ENABLE_CAPTCHA === 'false') return next();

        if (!captchaToken) {
            return res.status(400).json({
                success: false,
                message: 'CAPTCHA token is required'
            });
        }

        const result = await verifyCaptcha(captchaToken, req.ip);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Remove captcha token from body to clean up
        delete req.body.captchaToken;

        next();
    } catch (error) {
        console.error('CAPTCHA middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'CAPTCHA verification failed'
        });
    }
};

module.exports = {
    verifyCaptcha,
    captchaMiddleware
};
