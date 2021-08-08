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

const url = 'mongodb+srv://jatavor1:Jackson@12@cluster0.dkjo1.mongodb.net/infinity_market?retryWrites=true&w=majority'
mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

const app = express();
const port=3000;
app.listen(port)
console.log('Server started ....');

app.use(express.urlencoded({extended: true})); //to parse requests using req.body
app.use(express.json())
//app.use(express.static(path.join(__dirname, 'public'))); // set the path to public assets
app.use(session({
    secret:'topsecretkey',
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







