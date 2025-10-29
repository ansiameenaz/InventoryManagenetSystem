# Inventory Management System

A simple yet full-featured inventory management system built with a .NET Minimal API backend and a lightweight HTML/CSS/JS frontend. This application allows for real-time adding, updating, and deleting of stock items and maintains a complete audit trail of all changes.

## Screenshot

*You should take a screenshot of your running application and save it as `screenshot.png` in this folder. It will then appear here automatically.*

![A screenshot of the application's dashboard, showing the form and the inventory list.](./screenshot.png)

## Features

* **Add Inventory:** Create new product records with fields for name, SKU, category, quantity, price, and location.
* **Update Inventory:** Modify existing stock levels, prices, and other attributes.
* **Delete Inventory:** Remove obsolete or incorrect items from the database.
* **Duplicate SKU Validation:** The backend prevents creating two items with the same SKU.
* **Audit Trail:** Automatically logs every create, update, and delete operation for reporting and traceability.

## Technology Stack

### Backend

* **.NET 6 Minimal API:** A lightweight, high-performance framework for building the API.
* **Entity Framework Core:** Used as the ORM (Object-Relational Mapper) to interact with the database.
* **SQLite:** A serverless, file-based database, perfect for lightweight and quick-to-run projects.

### Frontend

* **HTML5:** For the structure of the web page.
* **CSS3:** For all custom styling and layout.
* **JavaScript (ES6+):** For all user interface logic, validation, and API communication.
* **Fetch API:** Used to make asynchronous requests (Add, Update, Delete) to the backend.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You must have the **.NET 6.0 SDK** (or newer) installed on your computer.
* [Download .NET SDK](https://dotnet.microsoft.com/download)

### Running the Application

1.  **Clone the repository** (or use the folder you already have):
    ```sh
    git clone [https://your-repository-url.git](https://your-repository-url.git)
    cd InventoryMS
    ```

2.  **Run the Backend API:**
    Navigate to the API folder and run the `dotnet` command.
    ```sh
    cd InventoryAPI
    dotnet run
    ```
    The terminal will show a message indicating the server is running, e.g., `Now listening on: http://localhost:5123`. **Note this URL!**

3.  **Update the API URL in the Frontend:**
    * Open the `frontend/app.js` file.
    * On the first line, change the `API_BASE_URL` constant to match the URL from your terminal.
        ```javascript
        // e.g., if your terminal says 5123
        const API_BASE_URL = 'http://localhost:5123';
        ```

4.  **Run the Frontend:**
    * Open the `frontend` folder.
    * **Right-click on the `index.html` file** and select "Open in Default Browser".

The application will now be running in your browser, fully connected to your backend.

## Folder Structure
You don't need to "add" the folder structure itself; you just need to add the text that describes it to your README.md file.

Here is the markdown code for that section. Just copy this block and paste it into your README.md file, probably after the "Getting Started" section.

Markdown

## Folder Structure

InventoryMS/ 
├── InventoryAPI/ # .NET Minimal API Backend 
│ 
├── Program.cs # All backend logic, API endpoints, and DB context 
│ ├── inventory.db # SQLite database file (created on run) │ └── InventoryAPI.csproj 
│ └── frontend/ # Frontend UI 
├── index.html # Main HTML page (the UI) 
├── style.css # All styles 
└── app.js # All frontend logic and API calls