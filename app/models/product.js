const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  sale: {
    type: String,
    required: true
  }
}, {
  timestamps: false
})

module.exports = productSchema
