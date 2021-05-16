const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth = require('../middleware/auth')

router.post("/tasks",auth, async (req, res) => {
    try {
      //const task = new Task(req.body);
      const task = new Task({
        ...req.body,
        owner: req.user._id
      })
      await task.save();
      res.status(200).send(task);
    } catch (e) {
      res.status(400).send(e);
    }
  
    // task.save().then(()=>{
    //     res.status(200).send(task)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
  });
  
  
  router.get("/tasks",auth, async (req, res) => {
      try{
          const task = await Task.find({owner:req.user._id})
          res.send(task);
      }catch(e){
          res.status(400).send();
      }
  //   const task = await Task.find({})
  //     .then((task) => {
  //       res.send(task);
  //     })
  //     .catch(() => {
  //       res.status(400).send();
  //     });
  });
  
  router.get("/tasks/:id", auth,async (req, res) => {
    const id = req.params.id;
    try{
      //const task = await Task.findById(id)
      const task = await Task.findOne({id, owner:req.user._id})
      if (!task) {
          return res.send({
            msg: "No tasks",
          });
        }
        res.send(task);
    }catch(e){
      res.status(400).send();
    }
  //   Task.findById(id)
  //     .then((task) => {
  //       if (!task) {
  //         return res.send({
  //           msg: "No tasks",
  //         });
  //       }
  //       res.send(task);
  //     })
  //     .catch(() => {
  //       res.status(400).send();
  //     });
  });
  
  
  router.patch('/tasks/:id',auth, async(req,res)=>{
      const id = req.params.id;
      const update = Object.keys(req.body);
      const onlyUpdate = ['description','completed'];
      const check = update.every((u)=>{
          return onlyUpdate.includes(u)
      })
      if(!check){
          return res.status(400).send('invalid updates')
      }
      try{

        //const task = await Task.findById(id);

        const task = await Task.findOne({_id:req.params.id, owner: req.user._id})

        
          //const task = await Task.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
          if(!task){
              res.status(400).send()
          }

          update.forEach((update)=>{
            task[update] = req.body[update]
        })
        await task.save()

          res.status(200).send(task);
      }catch(e){
          res.status(400).send(e)
      }
  
  })
  
  
  router.delete('/tasks/:id',auth,async (req,res)=>{
      const id = req.params.id;
  
      try{
          //const task = await Task.findByIdAndDelete(id)

          const task = await Task.findOneAndDelete({_id:id, owner: req.user._id})
          if(!task){
              return res.status(400).send('no user found')
          }
          res.status(200).send(task)
      }catch(e){
          res.status(400).send()
      }
  })

  module.exports = router;