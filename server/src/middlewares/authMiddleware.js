const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
    let token;

    // check token in header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try {
            // get token for header--lovely goutam darun kaj cholche chaliye jao
            token = req.headers.authorization.split(' ')[1]
            // verifiy tokn
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //get user from the token
             req.user = await User.findById(decoded.id).select('-password');

             next()
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            })
        }
    }


     if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

module.exports = {protect}