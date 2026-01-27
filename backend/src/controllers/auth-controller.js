import authService from "../services/auth-service.js";

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const logout = async (req, res, next) => {
    try {        
        const result = await authService.logout(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const getMe = async (req, res, next) => {
    try {
        const result = await authService.getMe(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const sendVerificationEmail = async (req, res, next) => {
    try {
        const result = await authService.sendVerificationEmail(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const verifyEmail = async (req, res, next) => {
    try {
        const result = await authService.verifyEmail(req.query);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const result = await authService.resetPassword(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    register,
    login,
    logout,
    getMe,
    sendVerificationEmail,
    verifyEmail,
    forgotPassword,
    resetPassword
}