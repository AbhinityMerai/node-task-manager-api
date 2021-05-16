const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { response } = require('express');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const { Timestamp } = require('bson');
require('dotenv').config();

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is incorrect')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        trim:true,
        validate(value){
            if(value.includes("password")){
                throw new Error('invalid password')
            }
        }
    },age:{
        type:Number,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error("age cannot be less than 0")
            }
        }
    },

    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
 
 }, {timestamps:true})

userSchema.methods.toJSON = function() {
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.tokens
    delete userObj.avatar
    return userObj;
}

 userSchema.methods.generateAuthToken = async function() {
     const user = this;
     const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    return token;
 }

userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error("invalid credentials")
    }
    const check = await bcrypt.compare(password, user.password)
    if(!check){
        throw new Error("invalid credentials")
    }
    return user;
}

userSchema.pre('save',async function(next){

    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
})

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User',userSchema)

 module.exports = User;