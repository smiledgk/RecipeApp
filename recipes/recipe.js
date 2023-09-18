const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    category: String,
    country: String,
    descr: String,
    thumbnail: String,
    rating: { type: Number, default: 0 },
    ratingDate: {type: String, default: 'n/a'},
    ingredients: [{ number: Number, product: String, measure: String }]
})

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;