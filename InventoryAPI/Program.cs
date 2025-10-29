// Program.cs
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore;
using Swashbuckle.AspNetCore.SwaggerUI;

// --- 3. Main Application Setup ---
// ALL THIS CODE MUST COME BEFORE THE CLASS DEFINITIONS
var builder = WebApplication.CreateBuilder(args);

// Add the SQLite database connection. It will create a file named "inventory.db".
builder.Services.AddDbContext<InventoryDbContext>(opt =>
    opt.UseSqlite("Data Source=inventory.db"));

// **Requirement: Error Handling**
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// **Requirement: Integration/API Endpoints**
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// **CRITICAL: Add CORS**
// This allows your Frontend (index.html) to call your Backend.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// Use the CORS policy
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- 4. API Endpoints (The Core Features) ---

// **Functional Objective: Add Inventory**
app.MapPost("/api/inventory", async (Product product, InventoryDbContext db) =>
{
    // **Requirement: Real-time validation (for duplicates)**
    if (await db.Products.AnyAsync(p => p.Sku == product.Sku))
    {
        return Results.Conflict("A product with this SKU already exists.");
    }

    // **Requirement: Audit Trail**
    var log = new AuditLog { Action = "CREATE", Details = $"Product '{product.Name}' (SKU: {product.Sku}) created." };
    db.AuditLogs.Add(log);
    
    db.Products.Add(product);
    
    // **Requirement: Rollback Mechanism**
    // SaveChangesAsync is a "transaction." If logging fails, the product add
    // will also be rolled back, ensuring data integrity.
    await db.SaveChangesAsync();
    
    return Results.Created($"/api/inventory/{product.Id}", product);
});

// **Use Case: Get all items (for Product Managers to see stock)**
app.MapGet("/api/inventory", async (InventoryDbContext db) =>
    await db.Products.ToListAsync());

// **Functional Objective: Update Inventory**
app.MapPut("/api/inventory/{id}", async (int id, Product updatedProduct, InventoryDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    // **Requirement: Audit Trail**
    var log = new AuditLog { Action = "UPDATE", Details = $"Product '{product.Name}' (ID: {id}) updated. Qty: {product.Quantity} -> {updatedProduct.Quantity}" };
    db.AuditLogs.Add(log);

    // Update all fields
    product.Name = updatedProduct.Name;
    product.Sku = updatedProduct.Sku;
    product.Category = updatedProduct.Category;
    product.Quantity = updatedProduct.Quantity;
    product.Price = updatedProduct.Price;
    product.Location = updatedProduct.Location;

    await db.SaveChangesAsync();
    return Results.Ok(product);
});

// **Functional Objective: Delete Inventory**
app.MapDelete("/api/inventory/{id}", async (int id, InventoryDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();
    
    // **Requirement: Audit Trail**
    var log = new AuditLog { Action = "DELETE", Details = $"Product '{product.Name}' (ID: {id}) deleted." };
    db.AuditLogs.Add(log);

    db.Products.Remove(product);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// **Requirement: Reporting Features**
app.MapGet("/api/reports/audit", async (InventoryDbContext db) =>
    await db.AuditLogs.OrderByDescending(log => log.Timestamp).ToListAsync());

// --- 5. Database Creation & App Start ---
// This will automatically create your "inventory.db" file the first time it runs.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    db.Database.EnsureCreated();
}

app.Run();


// --- 1. Database Model Definitions ---
// ALL THESE CLASSES MUST BE AT THE BOTTOM OF THE FILE
public class Product
{
    public int Id { get; set; }
    [Required]
    public string Sku { get; set; } = string.Empty;
    [Required]
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string Location { get; set; } = string.Empty;
}

public class AuditLog
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Action { get; set; } = string.Empty; // e.g., "ADD", "UPDATE", "DELETE"
    public string Details { get; set; } = string.Empty; // e.g., "Added Product SKU-123"
}

// --- 2. The Database Context ---
public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options) { }
    
    public DbSet<Product> Products { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
}