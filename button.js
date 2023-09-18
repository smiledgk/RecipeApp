console.log('priv')

window.addEventListener('DOMContentLoaded', () => {
    const populatingButton = document.querySelector('#populatingButton');

    populatingButton.addEventListener('click', async () => {
        await console.log('priv')
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
        const data = await res.json();
        const ejsRecipe = data.meals[0]
        console.log(ejsRecipe)
    })
})