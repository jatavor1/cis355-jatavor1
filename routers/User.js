const express = require('express');//importing express
const User = require('../models/User') //importing User module
const bcrypt = require('bcrypt')//bcrypt
const Product = require('../models/Product.js') //importing the product module

const router = new express.Router()//creating a router


/*
    Function to authenticate the user. Checkes to see if there is a session userID.
    Then checks to see if the ID exists. if it does exist then the next() is invoked.
*/
const authenticateUser = async (req,res,next)=>{
    if(!req.session.user_id){
        res.send({message: 'This page requires you to be logged in'})
    }
    else{
        try{
        const user = await User.findById(req.session.user_id)
        if(user === null){
            res.send({
                message: "This page require you to be logged in"
            })
        }
        else {
            req.user=user
            next()
        }
    }
    catch(e){
        res.send({
            message: "This page require you to be logged in"
        })
    } 
    }
}

//finding and responding with the specific user info
router.get('/users/me', authenticateUser, async (req,res)=>{

    let personID = req.session.user_id
    //console.log(personID)

    //finding the specific user
    const user = await User.findById(personID)
    const products = await Product.find({owner: user.user_name})
    
    //sending the username, name, balance and the items
    res.send({user_name: user.user_name, 
        name: user.name, 
        balance: user.balance,
        items: products
    })
    
})

//adding a new user to the database
router.post('/users/register',async (req, res)=>{
    let username = req.body.user_name;
    let password = req.body.password;
    let name = req.body.name;
    let balance = 0;

    //getting the user
    const sameUser = await User.findOne({user_name: username})

    //checking to see if the username has been taken
    if(sameUser !== null){
        res.send({message: 'Username already taken'})
    }
    else {

    //checking to see if a balance was entered
    if(req.body.balance !== undefined){
        balance = req.body.balance;
    try{
        password = await bcrypt.hash(password,8)
        const user = new User({name: name,user_name: username,password: password,balance: balance})
        const u = await user.save()
        req.session.user_id = u._id
        res.send({name: u.name,
                    user_name: u.user_name,
                    balance: u.balance,
                    id: u._id
        }) 
    }
    catch(e){
        console.log(e)  
    }
    }

    //if no balance was entered
    else {
        try{   
            password = await bcrypt.hash(password,8)
            const user = new User({name: name,user_name: username,password: password})
            const u = await user.save()
            req.session.user_id = u._id
            res.send({name: u.name,
                        user_name: u.user_name,
                        balance: u.balance,
                        id: u._id
            })
            
        }
        catch(e){
            console.log(e)
            
        }
    }
    }

    
})

//route for the user to login
router.post('/users/login', async (req,res)=>{

    let username = req.body.user_name
    let password = req.body.password
    const user = await User.findOne({user_name:username})

    //checking to see if the user exists
    if(user !== null){
          const result = await bcrypt.compare(password,user.password)

    //checking for the password
    if(result){
        req.session.user_id = user._id
        res.send({
            message: "Successfully logged in, Welcome " + user.name
        })
    }    
    else {
        res.send({
            message: "Error logging in. Incorrect password"
        })
    }
    }
    else {
        res.send({message: "Error logging in. Incorrect username"})
    }
})


//delete the user with the specific username
router.delete('/users/me', authenticateUser, async (req,res)=>{
    try{
        const user = await User.findById(req.session.user_id)
    //deleting the user profile
    await User.deleteOne({_id: req.session.user_id})
    //await Product.deleteMany({owner: user.user_name})
    req.session.destroy()
    res.send({message: user.user_name + ' Has been successfully deleted'})
    }
    catch(e){
        console.log(e)
    }
    
        
})

/*
    logging out route
*/
router.post('/users/logout', authenticateUser, async (req,res)=>{
    const user = await User.findById(req.session.user_id)

    //destroying the session
    req.session.destroy()
    res.send({message: 'Successfully logged out ' + user.name})

})

//exporting the router
module.exports = router
