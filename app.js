require('dotenv').config()
const express = require('express');
const path=require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const session = require('express-session')
const MongoStore = require('connect-mongo');
const User = require('./models/User.js')//import product module
const Product = require('./models/Product.js')
const userRouter = require('./routers/User.js')
const productRouter = require('./routers/Product.js')

const url = process.env.MONGO_URL
mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

const app = express();
app.listen(process.env.PORT)
console.log('Server started ....');

app.use(express.urlencoded({extended: true})); //to parse requests using req.body
app.use(express.json())
//app.use(express.static(path.join(__dirname, 'public'))); // set the path to public assets
app.use(session({
    secret: process.env.SESSION_KEY,
    resave:false,
    saveUninitialized:false,
    store: MongoStore.create({ mongoUrl: url })
}))

app.use(userRouter)
app.use(productRouter)

/*
    Summary route to send back all the users with their items
*/
app.get('/summary', async (req,res)=>{
    let summArr = []
    const users = await User.find({});
    for(let i = 0; i < users.length; i++){
         const products = await Product.find({owner: users[i].user_name});
        summArr.push(users[i], {items: products}, {id: users[i]._id})
    }
    res.send(summArr)
})







