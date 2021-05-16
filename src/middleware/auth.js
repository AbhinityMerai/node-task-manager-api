const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const auth = async (req,res,next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({_id:decoded._id, 'tokens.token': token})
        if(!user){
            throw new Error('No user for given token')
        }
        req.token = token;
        req.user = user;
    }catch(e){
        res.status(400).send({error:"please authenticate."})
    }
    next();
}

module.exports = auth;