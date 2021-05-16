const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true
}).then((s)=>{
    console.log("db connected ")
}).catch((e)=>{
    console.log("db connect error ")
})

