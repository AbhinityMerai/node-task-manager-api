require('../db/mongoose')
const Task = require('../models/task')

// Task.findByIdAndDelete('609a4f103c60ac05828ac8ad').then((task)=>{
//     console.log(task)
//     return Task.countDocuments({completed:false})
// }).then((result)=>{
//     console.log(result)
// }).catch((e)=>{
//     console.log(e)
// })

const task = async (id) => {
    const one = await Task.findByIdAndDelete(id)
    const two = await Task.countDocuments({completed:false});
    return two
}

task('609a4ef1880c2e057a7799ee').then((result)=>{
        console.log(result)
    }).catch((e)=>{
        console.log(e)
    })