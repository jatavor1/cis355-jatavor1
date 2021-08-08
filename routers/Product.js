const express = require('express'); //importing express
const Product = require('../models/Product.js') //importing the product module
const User = require('../models/User.js') //importing the user module


const router = new express.Router() //creating the router

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

//adding the item to the products collection in the database
router.post('/products', authenticateUser, async (req, res) => {
    const owner = await User.findById(req.session.user_id)
    let product = Product({
        name: req.body.name,
        owner: owner.user_name,
        price: req.body.price
    })
    
    //saving the product to the database
    const p = await product.save()
    res.send(product)
})

//getting all of the products and sending them back
router.get('/products', authenticateUser, async (req,res)=>{
    const products = await Product.find({})
    res.send(products)  
})

//buying an item
router.post('/products/buy', authenticateUser, async (req,res)=>{

    const productID = req.body.productID;//item id
    
    //finding the product info of the specific item id
    const product = await Product.findOne({_id: productID})
    const seller = await User.findOne({user_name: product.owner})
    const buyer = await User.findOne({_id: req.session.user_id})
    if(seller.user_name !== buyer.user_name){
        if(product.price > buyer.balance){
            res.send({message: 'Oops, ' + buyer.user_name + ' has insufficient funds'})
        }
        else {

            //if the buyer is not the seller and has suffecient funds
            await User.updateOne({user_name: buyer.user_name}, {$set: {balance: buyer.balance - product.price}})
            await User.updateOne({user_name: seller.user_name}, {$set: {balance: seller.balance + product.price}})
            await Product.updateOne({_id: productID}, {$set: {owner: buyer.user_name}})
            res.send({message: 'Transaction successful'})
        }
    }

    //if the buyer already owns the item
    else {
        res.send({message: 'Oops, ' + buyer.user_name + ' already owns this item'})
    }

})

//route to delete the specified productID
router.delete('/products/:id', authenticateUser, async (req,res)=>{
    const id = req.params.id;
    const product = await Product.findOne({_id: id})
    const user = await User.findOne({_id: req.session.user_id})

    //checking to see if the owner of the item is the same user logged in
    if(product.owner === user.user_name){
        await Product.deleteOne({_id: id})
        res.send("deletion was successful")
    }
    else {
        res.send("not authorized for this")
    }
})

//exporting the router
module.exports = router