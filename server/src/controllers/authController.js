const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
//generate web token

const generateToken = (id) => {
    return jwt.sign(
        {id},
        process.env.JWT_SECRET,
        {expiresIn:'10d'}
    )
}

// Register user
// @route   POST /api/auth/register
// @access  Public


const registerUser = async (req,res) =>{
    try {
        const {name, email, password} = req.body;
        //check if user is exist
        const userExist = await User.findOne({email});
        if(userExist){
            return res.send(400).json({
                success : 'falsh',
                message : 'user already exists'
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password : hashedPassword
        });

        if(user) {
            res.send(201).json({
                success: "true",
                message: "user register sucessfully",
                data:{
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                }
            })
        }
        
    } catch (error) {
        console.log("register error in authControler.js",error);
        res.send(500).json({
            success : "false",
            message: "server error in register process",
            error: error.message
        })
    }
}

// login user
// post   /api/auth/login

const loginUser = async () =>{
    try {
        const {email,password} = req.body
        // check user exist
        const user = await User.findOne({email})
        if(!user){
            res.send(401).json({
                success: "false",
                message: "user email or password"
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid) {
            res.send(402).json({
                success:'false',
                message:'invalide email or passswor'
            })
        }
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {registerUser, loginUser}