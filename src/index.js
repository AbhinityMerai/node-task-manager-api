const express = require("express");
const app = express();
require("./db/mongoose");
const taskRouter = require("./router/task")
const userRouter = require("./router/user")
const Task = require('./models/task')
const multer = require('multer')
require('dotenv').config();

const port = process.env.PORT;

// app.use((req,res,next)=>{
//   if(req){
//    return res.status(500).send('under maintenance')
//   }
// next();
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// const upload = multer({
//   dest:'image'
// })

// app.post('/upload', upload.single('upload'),(req,res)=>{
//   res.send();
// })

app.listen(port, () => {
  console.log("server running on port, " + port);
});

// const main = async () => {
//   const task = await Task.findById('609eb31c6fe221091f81edbe')
//   await task.populate('owner').execPopulate()
//   console.log(task.owner)
// }
// main()