const mongoose = require('mongoose'); //importing mongoose

const Schema = mongoose.Schema;

//schema for the product collection
const productSchema = new Schema({
      name: { type: 'string', required: true},
      price: { type: 'number', required: true},
      owner: { type: 'string', required: true}         
},
{ collection: 'products' })

const product = mongoose.model('product', productSchema);

//exporting the module
module.exports = product;