const mongoose = require('mongoose')//importing mongoose
const Schema = mongoose.Schema;

//the schema for the user collection
const userSchema = new Schema({
    name: { type: 'string', required: true },
    user_name: { type: 'string', required: true},
    balance: { type: 'number', default: 100},
    password: { type: 'string', required: true}
},
{ collection: 'users' })

userSchema.virtual("items", {
    ref: "Product",
    localField: "_id",
    foreignField: "owner"
  });


userSchema.set('toObject',{ virtuals: true })
const User = mongoose.model('User',userSchema)

//exporting the module
module.exports = User