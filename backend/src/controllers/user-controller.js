import userService from "../services/user-service.js";

const updateProfile = async (req, res, next) => {
    try {
        const result = await userService.updateProfile(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const updatePassword = async (req, res, next) => {
    try {
        const result = await userService.updatePassword(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const deleteAccount = async (req, res, next) => {
    try {
        const result = await userService.deleteAccount(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const setFcmToken = async (req, res, next) => {
    try {
        const result = await userService.setFcmToken(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    updateProfile,
    updatePassword,
    deleteAccount,
    setFcmToken
}