const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const Recipe = require('./recipes/recipe');
const { v4: uuid } = require('uuid');
const methodOverride = require('method-override')
uuid();

const asianCuisines = [
    'Chinese',
    'Japanese',
    'Korean',
    'Thai',
    'Indian',
    'Vietnamese',
    'Indonesian',
    'Malaysian',
    'Filipino',
    'Singaporean',
    'Sri Lankan',
    'Burmese',
    'Cambodian',
    'Nepali',
    'Bangladeshi',
];

const europeanCuisines = [
    'Italian',
    'French',
    'Spanish',
    'Greek',
    'German',
    'British',
    'Irish',
    'Portuguese',
    'Dutch',
    'Swiss',
    'Austrian',
    'Swedish',
    'Danish',
    'Norwegian',
    'Finnish',
];

const southAmericanCuisines = [
    'Brazilian',
    'Argentinian',
    'Peruvian',
    'Colombian',
    'Venezuelan',
    'Chilean',
    'Ecuadorian',
    'Bolivian',
    'Uruguayan',
    'Paraguayan',
    'Guyanese',
    'Surinamese',
];


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(methodOverride('_method'))

// mongoose connection setup
main().catch(err => console.log('CONNECTION FAILED!' + err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/recipes');
    await console.log('CONNECTION OPEN!')
}

app.get('/main', (req, res) => {
    res.render('index');
})

const recipes = []
const recipe = {}
app.post('/main/try', async (req, res) => {
    const result = await axios("https://www.themealdb.com/api/json/v1/1/random.php");
    const rec = result.data.meals[0]
    const ingredientss = createIngredientsObject(rec);
    const recipe = {
        uuid: uuid(),
        name: rec.strMeal,
        category: rec.strCategory,
        country: rec.strArea,
        descr: rec.strInstructions,
        thumbnail: rec.strMealThumb,
        ingredients: ingredientss
    }
    recipes.push(recipe)
    res.redirect(`/main/recipes/${recipe.uuid}`)
})

app.get('/main/add/:id', async (req, res) => {
    const { id } = req.params;
    const rec = recipes.find(r => r.uuid === id);
    const recipeDB = new Recipe({
        name: rec.name,
        category: rec.category,
        country: rec.country,
        descr: rec.descr,
        thumbnail: rec.thumbnail,
        ingredients: rec.ingredients,
    })
    try {
        await recipeDB.save();
        console.log("Saved!")
        res.redirect('/main/recipes')
    } catch (err) {
        res.status(500).send('Error saving the item to the database');
    }
})


app.get('/main/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = recipes.find(r => r.uuid === id);
        res.render('checkRecipe', { recipe });
    } catch (err) {
        console.log("Fail!")
        res.status(500).send('Error retrieving the item from the database');
    }
})

app.get('/main/recipes/recipe/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const recipe = await Recipe.findById(id);
        res.render('showRecipe', { recipe });
    } catch (err) {
        console.log('Item not found', err)
    }
})

app.get('/main/recipes', async (req, res) => {
    const recipes = await Recipe.find({});
    res.render('allTheRecipes', { recipes })
})

app.delete('/main/recipes/recipe/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Recipe.findByIdAndRemove(id)
        const recipes = await Recipe.find({});
        res.render('allTheRecipes', { recipes })
    } catch (err) {
        console.log('Item not found', err)
    }
})

function createIngredientsObject(rec) {
    const ingredientsPairs = Object.entries(rec).filter(([key, value]) => key.includes('strIngredient') && value !== "" && value !== null);
    const measurePairs = Object.entries(rec).filter(([key, value]) => key.includes('strMeasure') && value !== " " && value !== null && value !== "");

    const ingredientss = []
    for (let i = 0; i < ingredientsPairs.length; i++) {
        const ingredientsObject = {

        }

        ingredientsObject.number = i + 1;
        if (!Object.values(ingredientsPairs)[i][1] || !Object.values(measurePairs)[i][1] || Object.values(ingredientsPairs)[i][1] == undefined) {
            ingredientsObject.product = null;
            ingredientsObject.measure = null;
        } else {
            ingredientsObject.product = Object.values(ingredientsPairs)[i][1];
            ingredientsObject.measure = Object.values(measurePairs)[i][1];
        }
        ingredientss.push(ingredientsObject)

    }
    return ingredientss;
}



app.patch('/main/recipes/recipe/:id', async (req, res) => {
    const id = req.params.id;
    const rating = req.body.rating;
    const ratingSubmissionDate = new Date().toISOString().split('T')[0];
    try {
        await Recipe.findByIdAndUpdate(
            id,
            { $set: { rating: rating, ratingDate: ratingSubmissionDate } },
        )
        console.log('updated')
    } catch (err) {
        console.log('not updated!')
    }

    res.redirect(`/main/recipes/recipe/${id}`);
})



app.post('/main/recipes/:country', async (req, res) => {
    const { country } = req.params;
    const allRecipes = await Recipe.find({});
    console.log(allRecipes)
    let recipes = []
    switch (country) {
        case ('asian'):
            recipes = allRecipes.filter(recipe => asianCuisines.includes(recipe.country))
            break;
        case ('american'):
            recipes = allRecipes.filter(recipe => recipe.country == 'American')
            break;
        case ('southamerican'):
            recipes = allRecipes.filter(recipe => southAmericanCuisines.includes(recipe.country))
            break;
        case ('indian'):
            recipes = allRecipes.filter(recipe => recipe.country == 'Indian')
            break;
        case ('european'):
            recipes = allRecipes.filter(recipe => europeanCuisines.includes(recipe.country))
            break;
    }
    res.render('allTheRecipes', { recipes })
})

app.listen(3000, () => {
    console.log("Listening on Port 3000")
})
