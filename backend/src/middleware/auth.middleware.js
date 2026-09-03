const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const jwt = require("jsonwebtoken");

function getToken(req) {
    return req.headers.authorization?.split(" ")[1] || req.cookies.token;
}

async function verifyToken(req) {
    const token = getToken(req);
    if (!token) {
        return { error: { status: 401, message: "Unauthorized access, token is missing" } };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isBlacklisted = await tokenBlacklistModel.exists({ token });
    if (isBlacklisted) {
        return { error: { status: 401, message: "Unauthorized access, token has been logged out" } };
    }

    return { token, decoded };
}

async function authMiddleware(req,res,next){
    try {
        const { token, decoded, error } = await verifyToken(req);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized access, user not found" });
        }
        req.token = token;
        req.decodedToken = decoded;
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            message:"Unauthorized access , token is invalid"
        })
    }

}

async function systemUserMiddleware(req, res, next) {
    try {
        const { token, decoded, error } = await verifyToken(req);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }
        const user = await userModel.findById(decoded.userId).select("+systemUser");
        if (!user || !user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, user is not a system user"
            });
        }
        req.token = token;
        req.decodedToken = decoded;
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        });
    }
}

module.exports = { authMiddleware, systemUserMiddleware };