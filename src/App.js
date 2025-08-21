import React, { useState, useRef } from "react";
import "./App.css";

const StockManagementSystem = () => {
  const [activeSection, setActiveSection] = useState("view");
  const [stock, setStock] = useState([
    {
      id: "STK001",
      name: "Laptop",
      quantity: 10,
      price: 50000,
      category: "Electronic",
    },
    {
      id: "STK002",
      name: "Mouse",
      quantity: 25,
      price: 500,
      category: "Accessories",
    },
    {
      id: "STK003",
      name: "Keyboard",
      quantity: 15,
      price: 1200,
      category: "Accessories",
    },
  ]);
  const [cart, setCart] = useState([]);
  const [showBill, setShowBill] = useState(false);
  const [lastBill, setLastBill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStock, setFilteredStock] = useState(stock);
  const billRef = useRef();

  // Generate unique stock ID
  const generateStockId = () => {
    const existingIds = stock.map((item) =>
      parseInt(item.id.replace("STK", ""))
    );
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `STK${String(maxId + 1).padStart(3, "0")}`;
  };

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredStock(stock);
      return;
    }

    const filtered = stock.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase()) ||
        item.price.toString().includes(query) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStock(filtered);
  };

  // Update filtered stock when stock changes
  React.useEffect(() => {
    handleSearch(searchQuery);
  }, [stock, searchQuery]);
  const [newItem, setNewItem] = useState({
    name: "",
    id: "",
    quantity: "",
    price: "",
    category: "",
  });

  // Add Stock Form State
  // Add Stock Handler
  const handleAddStock = (e) => {
    e.preventDefault();
    if (
      !newItem.name ||
      !newItem.quantity ||
      !newItem.price ||
      !newItem.category
    ) {
      alert("Please fill all fields");
      return;
    }

    const newStockItem = {
      id: newItem.id.trim() ? newItem.id.trim() : generateStockId(),
      name: newItem.name,
      quantity: parseInt(newItem.quantity),
      price: parseFloat(newItem.price),
      category: newItem.category,
    };

    setStock([...stock, newStockItem]);
    setNewItem({ id: "", name: "", quantity: "", price: "", category: "" });
    alert("Stock added successfully!");
  };

  // Add to Cart Handler
  // Add to Cart Handler
  const addToCart = (item, quantity) => {
    if (quantity > item.quantity) {
      alert("Insufficient stock!");
      return;
    }

    // ✅ Update stock immediately
    const updatedStock = stock.map((stockItem) =>
      stockItem.id === item.id
        ? { ...stockItem, quantity: stockItem.quantity - quantity }
        : stockItem
    );
    setStock(updatedStock);

    // ✅ Update cart
    const existingCartItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingCartItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
  };

  // Remove from Cart
  // Remove from Cart

  const handleDelete = (productId) => {
    const confirmDelete = window.confirm(
      "⚠️ This will delete the whole stock. Are you sure?"
    );

    if (confirmDelete) {
      setStock(stock.filter((item) => item.productId !== productId));
    }
  };

  // Update Quantity in Cart (+ or -)
  const updateCartQuantity = (id, change) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;

        // Prevent going below 1
        if (newQuantity < 1) return item;

        // Check stock availability (when increasing)
        const stockItem = stock.find((s) => s.id === id);
        if (change > 0 && stockItem.quantity === 0) {
          alert("No more stock available!");
          return item;
        }

        // Update stock accordingly
        const updatedStock = stock.map((s) =>
          s.id === id ? { ...s, quantity: s.quantity - change } : s
        );
        setStock(updatedStock);

        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCart(updatedCart);
  };

  const removeFromCart = (id) => {
    const removedItem = cart.find((item) => item.id === id);

    if (removedItem) {
      // ✅ Restore stock when removing from cart
      const updatedStock = stock.map((stockItem) =>
        stockItem.id === id
          ? {
              ...stockItem,
              quantity: stockItem.quantity + removedItem.quantity,
            }
          : stockItem
      );
      setStock(updatedStock);
    }

    setCart(cart.filter((item) => item.id !== id));
  };

  // Process Sale
  const processSale = (createBill = false) => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // Update stock quantities
    const updatedStock = stock.map((stockItem) => {
      const cartItem = cart.find((item) => item.id === stockItem.id);
      if (cartItem) {
        return {
          ...stockItem,
          quantity: stockItem.quantity - cartItem.quantity,
        };
      }
      return stockItem;
    });

    setStock(updatedStock);

    if (createBill) {
      const bill = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };
      setLastBill(bill);
      setShowBill(true);
    }

    setCart([]);
    alert(
      createBill
        ? "Sale completed! Bill generated."
        : "Sale completed without bill."
    );
  };

  // Print Bill
  const printBill = () => {
    const printContent = billRef.current;
    const windowPrint = window.open("", "", "width=800,height=600");
    windowPrint.document.write(`
      <html>
        <head>
          <title>Bill</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .bill-header { text-align: center; margin-bottom: 20px; }
            .bill-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.print();
    windowPrint.close();
  };

  return (
    <div className="stock-management-container">
      <header className="header">
        <h1
          className="text-4xl font-extrabold text-center mb-6 
    bg-gradient-to-r from-blue-500 via-green-400 to-teal-500 
    bg-clip-text text-transparent animate-pulse"
        >
          Stock Management System
        </h1>
        <nav className="navigation">
          <button
            className={activeSection === "add" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveSection("add")}
          >
            Add Stock
          </button>
          <button
            className={activeSection === "view" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveSection("view")}
          >
            View Stock
          </button>
          <button
            className={activeSection === "sell" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveSection("sell")}
          >
            Sell Stock
          </button>
        </nav>
      </header>

      <main className="main-content">
        {/* Add Stock Section */}
        {activeSection === "add" && (
          <section className="add-stock-section">
            <h2>Add New Stock</h2>
            <div className="add-stock-form">
              <div className="form-group">
                <label htmlFor="name">Product Name:</label>
                <input
                  type="text"
                  id="name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="id">Product ID:</label>
                <input
                  type="text"
                  id="id"
                  value={newItem.id}
                  onChange={(e) =>
                    setNewItem({ ...newItem, id: e.target.value })
                  }
                  placeholder="Enter Product ID (e.g., STK010)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price (₹):</label>
                <input
                  type="number"
                  id="price"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select
                  id="category"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddStock}
                className="add-btn"
              >
                Add Stock
              </button>
            </div>
          </section>
        )}

        {/* View Stock Section */}
        {activeSection === "view" && (
          <section className="view-stock-section">
            <h2>Current Stock</h2>

            {/* Search Bar */}
            <div className="search-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by Product Name, ID, Price, or Category..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
                <div className="search-icon">🔍</div>
              </div>
              {searchQuery && (
                <p className="search-results">
                  Found {filteredStock.length} result
                  {filteredStock.length !== 1 ? "s" : ""} for "{searchQuery}"
                </p>
              )}
            </div>

            <div className="stock-table-container">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Stock ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Price (₹)</th>
                    <th>Total Value (₹)</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-results">
                        {searchQuery
                          ? "No products found matching your search."
                          : "No stock available."}
                      </td>
                    </tr>
                  ) : (
                    filteredStock.map((item) => (
                      <tr
                        key={item.id}
                        className={item.quantity < 5 ? "low-stock" : ""}
                      >
                        <td className="stock-id">{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price.toLocaleString()}</td>
                        <td>{(item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Sell Stock Section */}
        {activeSection === "sell" && (
          <section className="sell-stock-section">
            <div className="sell-container">
              <div className="available-stock">
                <h2>Available Stock</h2>

                {/* Search Bar for Sell Section */}
                <div className="search-container">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search products to sell..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="search-input"
                    />
                    <div className="search-icon">🔍</div>
                  </div>
                </div>

                <div className="stock-grid">
                  {filteredStock.filter((item) => item.quantity > 0).length ===
                  0 ? (
                    <p className="no-results">
                      {searchQuery
                        ? "No available products found matching your search."
                        : "No products available for sale."}
                    </p>
                  ) : (
                    filteredStock
                      .filter((item) => item.quantity > 0)
                      .map((item) => (
                        <StockCard
                          key={item.id}
                          item={item}
                          addToCart={addToCart}
                        />
                      ))
                  )}
                </div>
              </div>

              <div className="cart-section">
                <h2>Shopping Cart</h2>
                {cart.length === 0 ? (
                  <p className="empty-cart">Cart is empty</p>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map((item) => (
                        <div key={item.id} className="cart-item">
                          <div className="cart-item-info">
                            <h4>{item.name}</h4>
                            <div className="quantity-control">
                              <button
                                onClick={() => updateCartQuantity(item.id, -1)}
                                className="qty-btn"
                              >
                                −
                              </button>
                              <span className="qty-value">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, 1)}
                                className="qty-btn"
                              >
                                +
                              </button>
                            </div>
                            <p>× ₹{item.price.toLocaleString()}</p>

                            <p className="item-total">
                              Total: ₹
                              {(item.quantity * item.price).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="cart-total">
                      <h3>
                        Total: ₹
                        {cart
                          .reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                          .toLocaleString()}
                      </h3>
                    </div>
                    <div className="sale-buttons">
                      <button
                        onClick={() => processSale(false)}
                        className="sell-no-bill-btn"
                      >
                        Sell without Bill
                      </button>
                      <button
                        onClick={() => processSale(true)}
                        className="sell-with-bill-btn"
                      >
                        Sell with Bill
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bill Modal */}
      {showBill && lastBill && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="bill" ref={billRef}>
              <div className="bill-header">
                <h2>INVOICE</h2>
                <p>Bill No: {lastBill.id}</p>
                <p>Date: {lastBill.date}</p>
              </div>
              <div className="bill-details">
                <table>
                  <thead>
                    <tr>
                      <th>Stock ID</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastBill.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price.toLocaleString()}</td>
                        <td>
                          ₹{(item.quantity * item.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="total">
                  <p>Grand Total: ₹{lastBill.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={printBill} className="print-btn">
                Print Bill
              </button>
              <button onClick={() => setShowBill(false)} className="close-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stock Card Component for Sell Section
const StockCard = ({ item, addToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(item, parseInt(quantity));
    setQuantity(1);
  };

  return (
    <div className="stock-card">
      <div className="stock-id-badge">{item.id}</div>
      <h4>{item.name}</h4>
      <p className="category">{item.category}</p>
      <p className="price">₹{item.price.toLocaleString()}</p>
      <p className="available">Available: {item.quantity}</p>
      <div className="add-to-cart">
        <input
          type="number"
          min="1"
          max={item.quantity}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="quantity-input"
        />
        <button onClick={handleAddToCart} className="add-to-cart-btn">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default StockManagementSystem;
