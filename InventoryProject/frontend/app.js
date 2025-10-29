// app.js

// ** IMPORTANT **
// Check your terminal from Step 7.
// It will say "Now listening on: http://localhost:XXXX".
// Update the port number (XXXX) below to match.
const API_BASE_URL = 'http://localhost:5270'; // <-- UPDATE THIS PORT

// Get references to all our HTML elements
const form = document.getElementById('item-form');
const itemIdInput = document.getElementById('item-id');
const nameInput = document.getElementById('name');
const skuInput = document.getElementById('sku');
const categoryInput = document.getElementById('category');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const locationInput = document.getElementById('location');
const submitButton = document.getElementById('submit-button');
const clearButton = document.getElementById('clear-button');
const inventoryBody = document.getElementById('inventory-body');
const logBody = document.getElementById('log-body');

// --- Main Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadAuditLog();
});

form.addEventListener('submit', handleFormSubmit);
clearButton.addEventListener('click', clearForm);

// --- Core Data Functions ---

/**
 * Loads all inventory items and refreshes the main table
 */
async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/inventory`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const items = await response.json();
        
        inventoryBody.innerHTML = ''; // Clear existing table
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.sku}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.location}</td>
                <td>
                    <button class="edit-btn" onclick="editItem(${item.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem(${item.id}, '${item.name}')">Delete</button>
                </td>
            `;
            inventoryBody.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to load inventory:', error);
        alert('Error: Could not load inventory.');
    }
}

/**
 * Loads the audit log and refreshes the log table
 */
async function loadAuditLog() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reports/audit`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const logs = await response.json();
        
        logBody.innerHTML = ''; // Clear existing table
        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            `;
            logBody.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to load audit log:', error);
    }
}

/**
 * Handles both Add and Update operations
 */
async function handleFormSubmit(event) {
    event.preventDefault(); // Stop browser from reloading
    
    const item = {
        name: nameInput.value,
        sku: skuInput.value,
        category: categoryInput.value,
        quantity: parseInt(quantityInput.value, 10),
        price: parseFloat(priceInput.value),
        location: locationInput.value,
    };

    const id = itemIdInput.value;
    const isUpdating = id !== '';
    const url = isUpdating ? `${API_BASE_URL}/api/inventory/${id}` : `${API_BASE_URL}/api/inventory`;
    const method = isUpdating ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });

        if (response.status === 409) { // 409 Conflict (Duplicate SKU)
            alert('Error: An item with this SKU already exists.');
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        clearForm();
        loadInventory();
        loadAuditLog(); // Refresh logs after action
        
    } catch (error) {
        console.error('Failed to submit item:', error);
        alert('Error: Could not save item.');
    }
}

/**
 * Fills the form with an item's data for editing
 */
async function editItem(id) {
    // Find the item in the local table first (faster) or fetch it
    const item = (await (await fetch(`${API_BASE_URL}/api/inventory`)).json()).find(p => p.id === id);
    if (!item) return;

    itemIdInput.value = item.id;
    nameInput.value = item.name;
    skuInput.value = item.sku;
    categoryInput.value = item.category;
    quantityInput.value = item.quantity;
    priceInput.value = item.price;
    locationInput.value = item.location;
    
    submitButton.textContent = 'Update Item';
    submitButton.style.backgroundColor = '#f39c12'; // Change color to orange
    window.scrollTo(0, 0); // Scroll to top
}

/**
 * Deletes an item after confirmation
 */
async function deleteItem(id, name) {
    // **Requirement: Confirmation to prevent accidental removal**
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        loadInventory();
        loadAuditLog(); // Refresh logs
        
    } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Error: Could not delete item.');
    }
}

/**
 * Resets the form to its default state
 */
function clearForm() {
    form.reset();
    itemIdInput.value = '';
    submitButton.textContent = 'Add Item';
    submitButton.style.backgroundColor = '#3498db'; // Reset to blue
}