import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../../models/User.js";
import asyncHandler from "express-async-handler";


const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Please provide all the required fields" });
    const foundUser = await User.findOne({ username }).lean();
    // we dont even want them to know whether the user is not active >:)
    if (!foundUser || !foundUser.active) return res.status(401).json({ message: "Unauthorized" });
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return res.status(401).json({ message: "Unauthorized" });
    const accessToken = jwt.sign(
        {
            UserInfo: {
                username: foundUser.username,
                roles: foundUser.roles,
                id: foundUser._id
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        { username : foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie( 
        'refreshToken',
        refreshToken,
        {
            httpOnly: true, // accessbility only on webserver
            secure: true, // https
            sameSite: "None", // cross-site cookie
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    );
    res.status(200).json({ accessToken });
});


const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.status(401).json({ message: "Unauthorized" });
    const refreshToken = cookies.refreshToken;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            // err -> if expired
            if (err) return res.status(401).json({ message: "Unauthorized" });
            const foundUser = await User.findOne({ username: decoded.username });
            if (!foundUser) return res.status(401).json({ message: "Unauthorized" });
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        username: foundUser.username,
                        roles: foundUser.roles,
                        id: foundUser.id
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );
            res.status(200).json({ accessToken });
        }),
    );
});


const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(204);
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });
    res.json({ message: "Cookie  cleared" });
});


export default {
    login,
    refresh,
    logout
};
