document.addEventListener('DOMContentLoaded', () => {
    const recipeListDiv = document.getElementById('recipeList');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const recipeModal = document.getElementById('recipeModal');
    const viewRecipeModal = document.getElementById('viewRecipeModal');
    const closeModalButtons = document.querySelectorAll('.close-button');
    const viewCloseButton = document.querySelector('.view-close-button');
    const recipeForm = document.getElementById('recipeForm');
    const saveRecipeBtn = document.getElementById('saveRecipeBtn');
    const searchInput = document.getElementById('searchInput');

    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let editingRecipeId = null;

    // Elements for recipe form
    const recipeNameInput = document.getElementById('recipeName');
    const recipeImageInput = document.getElementById('recipeImage');
    const ingredientsTextarea = document.getElementById('ingredients');
    const instructionsTextarea = document.getElementById('instructions');
    const prepTimeInput = document.getElementById('prepTime');
    const servingsInput = document.getElementById('servings');

    // Elements for view recipe modal
    const viewRecipeTitle = document.getElementById('viewRecipeTitle');
    const viewRecipeImage = document.getElementById('viewRecipeImage');
    const viewRecipePrepTime = document.getElementById('viewRecipePrepTime');
    const viewRecipeServings = document.getElementById('viewRecipeServings');
    const viewRecipeIngredients = document.getElementById('viewRecipeIngredients');
    const viewRecipeInstructions = document.getElementById('viewRecipeInstructions');
    const editRecipeBtn = document.getElementById('editRecipeBtn');
    const deleteRecipeBtn = document.getElementById('deleteRecipeBtn');

    // Function to render recipes
    function renderRecipes(filter = '') {
        recipeListDiv.innerHTML = ''; // Clear current recipes

        const filteredRecipes = recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(filter.toLowerCase()) ||
            recipe.ingredients.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredRecipes.length === 0 && filter !== '') {
            recipeListDiv.innerHTML = '<p style="text-align: center; width: 100%;">No recipes found matching your search.</p>';
            return;
        } else if (filteredRecipes.length === 0) {
            recipeListDiv.innerHTML = '<p style="text-align: center; width: 100%;">No recipes yet! Click "Add New Recipe" to get started.</p>';
            return;
        }


        filteredRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.dataset.id = recipe.id;

            const imageSrc = recipe.image || 'images/default.jpg'; // Use a default image if none provided

            recipeCard.innerHTML = `
                <img src="${imageSrc}" alt="${recipe.name}">
                <h3>${recipe.name}</h3>
                <p>${recipe.ingredients.substring(0, 100)}...</p>
            `;
            recipeCard.addEventListener('click', () => openViewRecipeModal(recipe.id));
            recipeListDiv.appendChild(recipeCard);
        });
    }

    // Function to open the Add/Edit Recipe Modal
    function openRecipeModal(recipe = null) {
        recipeModal.style.display = 'block';
        if (recipe) {
            editingRecipeId = recipe.id;
            document.getElementById('modalTitle').textContent = 'Edit Recipe';
            recipeNameInput.value = recipe.name;
            recipeImageInput.value = recipe.image || '';
            ingredientsTextarea.value = recipe.ingredients;
            instructionsTextarea.value = recipe.instructions;
            prepTimeInput.value = recipe.prepTime;
            servingsInput.value = recipe.servings;
        } else {
            editingRecipeId = null;
            document.getElementById('modalTitle').textContent = 'Add New Recipe';
            recipeForm.reset(); // Clear form for new recipe
        }
    }

    // Function to open the View Recipe Modal
    function openViewRecipeModal(id) {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return;

        viewRecipeTitle.textContent = recipe.name;
        viewRecipeImage.src = recipe.image || 'images/default.jpg';
        viewRecipeImage.alt = recipe.name;
        viewRecipePrepTime.textContent = recipe.prepTime || 'N/A';
        viewRecipeServings.textContent = recipe.servings || 'N/A';

        viewRecipeIngredients.innerHTML = '';
        recipe.ingredients.split('\n').forEach(ingredient => {
            if (ingredient.trim()) {
                const li = document.createElement('li');
                li.textContent = ingredient.trim();
                viewRecipeIngredients.appendChild(li);
            }
        });
        viewRecipeInstructions.textContent = recipe.instructions;

        editRecipeBtn.onclick = () => {
            viewRecipeModal.style.display = 'none'; // Close view modal
            openRecipeModal(recipe); // Open edit modal with recipe data
        };

        deleteRecipeBtn.onclick = () => deleteRecipe(recipe.id);

        viewRecipeModal.style.display = 'block';
    }

    // Function to close any modal
    function closeModals() {
        recipeModal.style.display = 'none';
        viewRecipeModal.style.display = 'none';
    }

    // Save/Update Recipe
    recipeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newRecipe = {
            id: editingRecipeId || Date.now().toString(), // Use existing ID or generate new
            name: recipeNameInput.value.trim(),
            image: recipeImageInput.value.trim(),
            ingredients: ingredientsTextarea.value.trim(),
            instructions: instructionsTextarea.value.trim(),
            prepTime: parseInt(prepTimeInput.value) || 0,
            servings: parseInt(servingsInput.value) || 0
        };

        if (editingRecipeId) {
            // Update existing recipe
            recipes = recipes.map(recipe =>
                recipe.id === editingRecipeId ? newRecipe : recipe
            );
        } else {
            // Add new recipe
            recipes.push(newRecipe);
        }

        localStorage.setItem('recipes', JSON.stringify(recipes));
        renderRecipes();
        closeModals();
    });

    // Delete Recipe
    function deleteRecipe(id) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            recipes = recipes.filter(recipe => recipe.id !== id);
            localStorage.setItem('recipes', JSON.stringify(recipes));
            renderRecipes();
            closeModals();
        }
    }

    // Event Listeners
    addRecipeBtn.addEventListener('click', () => openRecipeModal());
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    viewCloseButton.addEventListener('click', closeModals);

    window.addEventListener('click', (event) => {
        if (event.target == recipeModal || event.target == viewRecipeModal) {
            closeModals();
        }
    });

    searchInput.addEventListener('input', (e) => {
        renderRecipes(e.target.value);
    });

    // Initial render
    renderRecipes();
});