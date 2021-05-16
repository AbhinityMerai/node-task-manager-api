const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

router.use(express.json());

router.post("/users", async (req, res) => {
  const user =  new User(req.body);
  try {
    
    await user.save();
    const token = await user.generateAuthToken();
    user.tokens = user.tokens.concat({token})
    await user.save();
    
    res.status(200).send({user,token});
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req,res)=>{
  try{
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    user.tokens = user.tokens.concat({token})
  
    await user.save();

    res.status(200).send({user,token});
  }catch(e){
    res.status(400).send({
      error:"invalid credentials"
    })
  }
})

router.get("/users/me",auth, async (req, res) => {
  req.user.password = undefined;
  req.user.tokens = undefined;
  res.send(req.user);
    // try {
    //   const user = await User.find({});
    //   res.status(200).send(user);
    // } catch (e) {
    //   res.status(400).send(e);
    // }
  
    // User.find({}).then((user)=>{
    //     res.status(200).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
  });
  
  router.get("/users/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(400).send();
      }
      res.status(200).send(user);
    } catch (e) {
      res.status(400).send();
    }
  
    // User.findById(id).then((user)=>{
    //     if(!user){
    //         return res.status(400).send()
    //     }
    //     res.status(200).send(user)
    // }).catch(()=>{
    //     res.status(400).send();
    // })
  });
  router.patch('/users/me',auth, async(req,res)=>{
    const id = req.params.id;
    const update = Object.keys(req.body);
    const onlyUpdate = ['name','email','password','age'];
    const check = update.every((u)=>{
        return onlyUpdate.includes(u)
    })
    if(!check){
        return res.status(400).send('invalid updates')
    }
    try{

        // const user = await User.findById(id);
        // update.forEach((update)=>{
        //     user[update] = req.body[update]
        // })
        // await user.save()

        // //const user = await User.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
        // if(!user){
        //     res.status(400).send()
        // }
        update.forEach((update)=>{
              req.user[update] = req.body[update]
          })
        await req.user.save();
        res.status(200).send(req.user);
    }catch(e){
        res.status(400).send(e)
    }

})
router.delete('/users/me',auth,async (req,res)=>{

  await req.user.remove()
  res.send(req.user);

    // const id = req.params.id;

    // try{
    //     const user = await User.findByIdAndDelete(id)
    //     if(!user){
    //         return res.status(400).send('no user found')
    //     }
    //     res.status(200).send(user)
    // }catch(e){
    //     res.status(400).send()
    // }
})

router.post('/users/logout', auth, async (req,res)=>{
  try{
    req.user.tokens = req.user.tokens.filter((token)=>{
      return token.token !== req.token
    })

    await req.user.save();
    res.send();
  }catch(e){
    res.status(400).send();
  }
 
})
router.post('/users/logoutAll', auth, async (req,res)=>{
  try{
    req.user.tokens = [];
    await req.user.save();
    res.send();
  }catch(e){
    res.status(400).send();
  }
 
})
const upload = multer({
  limits:{
    fileSize: 1000000
  },
  fileFilter(req,file,callback){
    if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
      return callback(new Error('please upload image'))
    }
    callback(undefined,true)
  }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
  const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
  req.user.avatar = buffer;
  //req.user.avatar = req.file.buffer;
  await req.user.save()
  res.send();
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth, async(req,res)=>{
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar', async(req,res)=>{
  const user = await User.findById(req.params.id);

  try{
    if(!user || !user.avatar){
      throw new Error('No user avatar found')
    }
    res.set('Content-Type','image/png');
    res.send(user.avatar)
  }catch(e){
    res.status(400).send()
  }
})
module.exports = router;