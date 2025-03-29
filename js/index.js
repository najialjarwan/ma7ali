const firebaseConfig = {
    apiKey: "AIzaSyADCUzBdWRmheIFqQU6p-Oyf6sZ1mQynPY",
    authDomain: "paperless-a64a0.firebaseapp.com",
    projectId: "paperless-a64a0",
    storageBucket: "paperless-a64a0.firebasestorage.app",
    messagingSenderId: "554212290727",
    appId: "1:554212290727:web:ba60b058c0305284902b82",
    measurementId: "G-R3D4GLJTD2",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
window.db = db;

db.collection("test")
    .get()
    .then((snapshot) => {
        console.log("Firestore is connected!", snapshot.docs);
    })
    .catch((error) => {
        console.error("Error connecting to Firestore:", error);
    });

function initializeEventListeners() {

    const popButton = document.getElementById("pop");
    const slider = document.getElementById("slider");

    popButton.addEventListener("click", function (e) {
        slider.classList.toggle("active");
        popButton.classList.toggle("active");
        e.stopPropagation();
        document.getElementById("add-customer-btn").addEventListener("click", function () {
            const section = this.getAttribute("data-section");
            if (section) {
                indicator.classList.remove("active-indicator");
                slider.classList.remove("active");
                popButton.classList.remove("active");
                removeActive();
                loadContent(section);
            }
        });
    });

    document.addEventListener("click", function (e) {
        if (!slider.contains(e.target) && !popButton.contains(e.target)) {
            slider.classList.remove("active");
            popButton.classList.remove("active");
        }
    });

    const indicator = document.querySelector(".active-indicator");
    loadContent("dashboard");
    document.querySelectorAll(".nav-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const section = this.getAttribute("data-section");
            if (section) {
                loadContent(section);
            }
            removeActive();
            indicator.classList.add("active-indicator");
            this.classList.add("active");

            const buttonLeft = this.offsetLeft;
            const buttonWidth = this.offsetWidth;

            indicator.style.transform = `translateX(${buttonLeft}px)`;
            indicator.style.width = `${buttonWidth}px`;
        });
    });


    document.querySelector(".menu-btn").addEventListener("click", toggleSidebar);
    document.querySelector("#close-btn").addEventListener("click", closeSidebar);

    document.querySelector("#toggle-theme-btn").addEventListener("click", (e) => {
        e.preventDefault();
        toggleTheme();
    });

    document.querySelector("#feedback-btn").addEventListener("click", (e) => {
        e.preventDefault();
        openFeedbackModal();
    });

    document.querySelector("#submit-feedback").addEventListener("click", submitFeedback);

    document.querySelector(".close-modal").addEventListener("click", () => {
        document.getElementById("feedback-modal").style.display = "none";
    });

    function removeActive() {
        document.querySelectorAll(".nav-btn").forEach((btn) =>
            btn.classList.remove("active"));
    }
}

async function loadContent(section) {

    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = "<p>Loading...</p>";
    try {
        const response = await fetch(`./pages/${section}.html?nocache=${Date.now()}`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
        mainContent.innerHTML = html;

        if (section === "products") {
            initProductPage();
        }
        if (section === "customers") {
            initCustomersPage();
        }
        if (section === "adder") {
            showCustomerForm();
        }
    } catch (error) {
        mainContent.innerHTML = `<h2>Error loading ${section}. Please try again later.</h2>`;
        console.error(error);
    }
}

//Products Section//
function initProductPage() {

    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = `
        <div id="filter-options" class="filter-options">
            <div class="filter-group">
                <label for="category-select">Filter by Category:</label>
                <select id="category-select">
                    <option value="">All Categories</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="sort-select">Sort by Price:</label>
                <select id="sort-select">
                    <option value="asc">Lowest to Highest</option>
                    <option value="desc">Highest to Lowest</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="stock-select">Filter by Stock:</label>
                <select id="stock-select">
                    <option value="">All Stock Levels</option>
                    <option value="low-stock">Low Stock (1-10)</option>
                    <option value="medium-stock">Medium Stock (11-50)</option>
                    <option value="high-stock">High Stock (51+)</option>
                </select>
            </div>
            <button class="func-btn" id="export-product-btn">EXPORT PRODUCTS</button>
        </div>
        <div id="products-grid" class="products-grid"></div>
    `;
    fetchProducts();
    document.getElementById("add-product-btn").addEventListener("click", () => {
        const mainContent = document.querySelector(".main-content");
        mainContent.innerHTML = `
            <h2>Add a New Product</h2>
            <form id="product-form" class="product-form">
                <label for="barcode">Barcode: </label>
                <input type="text" id="barcode" name="barcode" ><br>

                <label for="label">Product Label: </label>
                <input type="text" id="label" name="label" ><br>

                <label for="img">Product Image: <span id="fileName">No file selected!</span> </label>
                <input type="file" id="img" name="img" accept="image/*" capture="environment" class="file-input">
                <button type="button" id="customFileButton">Choose File</button>

                <label for="price">Price ($): </label>
                <input type="number" id="price" name="price" ><br>

                <label for="category">Category: </label>
                <input type="text" id="category" name="category"><br>

                <label for="stock">Stock Quantity: </label>
                <input type="number" id="stock" name="stock" ><br>

                <button type="submit">Add</button>
            </form>
        `;
        addProduct();
        document.getElementById("customFileButton").addEventListener("click", () => {
            document.getElementById("img").click(); // Trigger the file input
        });
        document.getElementById("img").addEventListener("change", (event) => {
            const fileName = event.target.files[0]?.name || "No file selected";
            document.getElementById("fileName").textContent = `Selected: ${fileName}`;
        });
    });

    document.body.addEventListener("click", async (event) => {
        if (event.target && event.target.id === "export-product-btn") {
            try {
                const products = await fetchProductsforExporting();
                const exportType = document.getElementById("export-type-select")?.value || "pdf";

                if (exportType === "pdf") {
                    exportToPDF(products);
                } else if (exportType === "csv") {
                    exportToCSV(products);
                } else {
                    console.error("Invalid export type selected!");
                }
            } catch (error) {
                console.error("Error exporting products:", error);
            }
        }
    });
}

async function fetchProducts() {
    const productsGrid = document.getElementById("products-grid");
    const categorySelect = document.getElementById("category-select");
    const sortSelect = document.getElementById("sort-select");
    const stockSelect = document.getElementById("stock-select");

    try {
        const snapshot = await db.collection("products").get();

        if (snapshot.empty) {
            productsGrid.innerHTML = "<p>No products available.</p>";
            return;
        }

        const products = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "Unknown Date"
            };
        });

        const uniqueCategories = [...new Set(products.map(product => product.category))];
        uniqueCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        const applyFilters = () => {
            let filteredProducts = [...products];

            // Filter by category
            const selectedCategory = categorySelect.value;
            if (selectedCategory) {
                filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
            }

            // Filter by stock range
            const stockRange = stockSelect.value;
            if (stockRange) {
                switch (stockRange) {
                    case "low-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock >= 1 && product.stock <= 10);
                        break;
                    case "medium-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock >= 11 && product.stock <= 50);
                        break;
                    case "high-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock > 50);
                        break;
                }
            }

            const sortOrder = sortSelect.value;
            if (sortOrder) {
                filteredProducts = filteredProducts.sort((a, b) =>
                    sortOrder === "asc" ? a.price - b.price : b.price - a.price
                );
            }
            renderProducts(filteredProducts);
        };

        const renderProducts = (filteredProducts) => {
            productsGrid.innerHTML = "";

            filteredProducts.forEach(product => {
                const productCard = document.createElement("div");
                productCard.className = "product-card";

                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.img}" alt="${product.label}">
                    </div>
                    <div class="product-details">
                        <p><strong>Label:</strong> ${product.label}</p>
                        <p><strong>Barcode:</strong> ${product.barcode}</p>
                        <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                        <p><strong>Category:</strong> ${product.category}</p>
                        <p><strong>Stock:</strong> ${product.stock}</p>
                        <p><strong>Created At:</strong> ${product.createdAt}</p>
                    </div>
                        `;

                productsGrid.appendChild(productCard);
            });
        };

        categorySelect.addEventListener("change", applyFilters);
        stockSelect.addEventListener("change", applyFilters);
        sortSelect.addEventListener("change", applyFilters);

        renderProducts(products);
    } catch (error) {
        productsGrid.innerHTML = `<p>Error fetching products: ${error.message}</p>`;
        console.error("Error fetching products:", error);
    }
}

async function addProduct() {
    const form = document.getElementById("product-form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        // Function to convert HEIC/large images to JPEG and lower resolution
        const convertToJPEG = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");

                        // Lower resolution for faster upload
                        const maxWidth = 250; // Adjust as needed
                        const maxHeight = 250;

                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > maxWidth) {
                                height = (height * maxWidth) / width;
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = (width * maxHeight) / height;
                                height = maxHeight;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);

                        canvas.toBlob(
                            (blob) => resolve(blob),
                            "image/jpeg", // Convert to JPEG for smaller file size
                            0.3 // Adjust quality for faster uploads
                        );
                    };
                    img.src = event.target.result;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        const imageFile = formData.get("img");
        let imgUrl = "";
        if (imageFile) {
            try {
                console.time("ImageResizeAndUpload"); // Start timer for debugging
                const resizedImage = await convertToJPEG(imageFile); // Convert HEIC and resize
                const storageRef = storage.ref();
                const imageRef = storageRef.child(`product-images/${imageFile.name}`);
                await imageRef.put(resizedImage); // Upload resized image
                imgUrl = await imageRef.getDownloadURL(); // Get uploaded image URL
                console.timeEnd("ImageResizeAndUpload"); // End timer for debugging
            } catch (error) {
                console.error("Image upload failed:", error);
                showModalMessage("Image upload failed. Please try again.", false);
                return; // Stop further execution if upload fails
            }
        }

        const productData = {
            barcode: formData.get("barcode"),
            label: formData.get("label"),
            img: imgUrl,
            price: parseFloat(formData.get("price")),
            category: formData.get("category"),
            stock: parseInt(formData.get("stock"), 10),
        };

        if (
            !productData.barcode ||
            !productData.label ||
            isNaN(productData.price) ||
            isNaN(productData.stock) ||
            !formData.get("img")
        ) {
            showModalMessage("Please fill in all required fields, including the product image.", false);
            return;
        }

        try {
            // Check if a product with the same barcode or label already exists
            const snapshot = await db.collection("products")
                .where("barcode", "==", productData.barcode)
                .get();

            const labelSnapshot = await db.collection("products")
                .where("label", "==", productData.label)
                .get();

            if (!snapshot.empty || !labelSnapshot.empty) {
                showModalMessage("Item already exists. Please update the item instead.", false);
                form.reset();
                return;
            }

            // Add product to Firestore
            try {
                const docRef = await db.collection("products").add({
                    ...productData,
                    createdAt: firebase.firestore.Timestamp.now() // ✅ Store Firestore Timestamp correctly
                });

                // Fetch the newly added document to get the correct timestamp
                const newDoc = await docRef.get();
                const newProductData = newDoc.data();

                // Add the new product to `allProducts`
                allProducts.push({
                    ...newProductData,
                    id: docRef.id, // Firestore-generated ID
                    createdAt: newProductData.createdAt.toDate().toLocaleDateString() // ✅ Get proper date
                });

                showModalMessage("Product added successfully!", true);
                form.reset();
            } catch (error) {
                console.error("Error adding product:", error);
                showModalMessage(`Failed to add product: ${error.message}`, false);
            }
        } catch (error) {
            showModalMessage(`Failed to add product: ${error.message}`, false);
            console.error("Error adding product:", error);
        }
    });
}
let allProducts = [];
$(document).ready(function () {

    const db = firebase.firestore();

    function fetchProducts() {
        return db.collection("products").get().then((querySnapshot) => {
            let products = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                products.push({
                    id: doc.id,
                    label: data.label,
                    barcode: data.barcode,
                    price: data.price || 0,
                    category: data.category || "Unknown",
                    stock: data.stock || 0,
                    img: data.img || "placeholder.jpg",
                    createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "Unknown Date", // Temporary timestamp
                });
            });
            return products;
        }).catch((error) => {
            console.error("Error fetching products:", error);
            return [];
        });
    }

    function displayProducts(filteredProducts) {
        let productCards = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.img}" alt="${product.label}">
            </div>
            <div class="product-details">
                <p><strong>Label:</strong> ${product.label}</p>
                <p><strong>Barcode:</strong> ${product.barcode}</p>
                <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Stock:</strong> ${product.stock}</p>
                <p><strong>Created At:</strong> ${product.createdAt}</p>
            </div>
        </div>
    `).join("");

        let productsGrid = `<div id="products-grid" class="products-grid">${productCards}</div>`;
        $(".main-content").html(productCards ? productsGrid : "<p>No products found.</p>");

        // Add click event to display product form in .main-content
        $(".product-card").on("click", function () {
            const productId = $(this).data("id");
            const product = allProducts.find(p => p.id === productId);
            displayProductForm(product);
        });
    }

    function displayProductForm(product) {
        const formHtml = `
            <h3>Update Product: </h3>
            <form id="product-form" class="product-form">
                <label for="label">Label:</label>
                <input type="text" id="label" name="label" value="${product.label}">
                
                <label for="barcode">Barcode:</label>
                <input type="text" id="barcode" name="barcode" value="${product.barcode}">

                <div class="file-container">
                    <label for="img">Image: <span id="fileName">No file selected!</span> </label>
                    <input type="file" id="img" name="img" accept="image/*" capture="environment" class="file-input">
                    <button type="button" id="customFileButton">Update Image:</button>
                </div>
                
                <label for="price">Price:</label>
                <input type="number" id="price" name="price" value="${product.price}">
                
                <label for="category">Category:</label>
                <input type="text" id="category" name="category" value="${product.category}">
                
                <label for="stock">Stock:</label>
                <input type="number" id="stock" name="stock" value="${product.stock}">
                
                <button type="submit" id="update-button">Update</button>
                <button type="button" id="remove-button">Remove Product</button>
                <button type="button" id="cancel-button">Cancel</button>
            </form>
        `;

        $(".main-content").html(formHtml);

        // Custom behavior for file input
        const fileInput = document.getElementById("img");
        const customFileButton = document.getElementById("customFileButton");
        const fileNameSpan = document.getElementById("fileName");

        customFileButton.addEventListener("click", () => {
            fileInput.click(); // Trigger the hidden file input
        });

        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                fileNameSpan.textContent = fileInput.files[0].name; // Display file name
            } else {
                fileNameSpan.textContent = "No file selected!"; // Reset text if no file is chosen
            }
        });

        $("#product-form").on("submit", function (e) {
            e.preventDefault();

            const updatedProduct = {
                label: $("#label").val(),
                barcode: $("#barcode").val(),
                price: parseFloat($("#price").val()),
                category: $("#category").val(),
                stock: parseInt($("#stock").val(), 10),
            };

            const file = $("#img")[0].files[0];
            if (file && file.size > 0) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;

                    img.onload = () => {
                        // Create a canvas for image resizing and conversion
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");

                        // Set maximum dimensions for the image (control pixels)
                        const maxWidth = 250; // Adjust as needed
                        const maxHeight = 250;

                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > maxWidth) {
                                height = (height * maxWidth) / width;
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = (width * maxHeight) / height;
                                height = maxHeight;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Draw the resized image onto the canvas
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert the canvas content to WEBP or JPEG and control quality
                        canvas.toBlob(
                            (blob) => {
                                const storageRef = storage.ref(`product-images/${product.id}/${file.name.split(".")[0]}.webp`);
                                const metadata = { contentType: "image/webp" };

                                // Upload the optimized image
                                storageRef.put(blob, metadata)
                                    .then(snapshot => snapshot.ref.getDownloadURL()) // Get the image URL
                                    .then(url => {
                                        updatedProduct.img = url; // Add image URL to the updated product

                                        // Update product details in Firestore
                                        db.collection("products").doc(product.id).update(updatedProduct)
                                            .then(() => {
                                                console.log("Product updated successfully!");
                                                showModalMessage("Product Updated Successfully!", true);
                                                fetchProducts().then((products) => {
                                                    allProducts = products; // Refresh the local array
                                                    displayProducts(products); // Refresh UI
                                                });
                                            })
                                            .catch(error => {
                                                console.error("Error updating product:", error);
                                            });
                                    })
                                    .catch(error => {
                                        console.error("Error uploading image:", error);
                                        showModalMessage("Image upload failed. Please try again.", false);
                                    });
                            },
                            "image/webp", // Format (use JPEG if required)
                            0.3 // Adjust quality for better control (lower = smaller file, worse quality)
                        );
                    };
                };

                reader.readAsDataURL(file); // Read the image as a Data URL
            } else {
                // Update Firestore directly if no image file is provided
                db.collection("products").doc(product.id).update(updatedProduct)
                    .then(() => {
                        console.log("Product updated successfully!");
                        showModalMessage("Product Updated Successfully!", true);
                        fetchProducts().then((products) => {
                            allProducts = products; // Update local array
                            displayProducts(products); // Refresh UI
                        });
                    })
                    .catch(error => {
                        console.error("Error updating product:", error);
                    });
            }
        });

        // Cancel button functionality
        $("#cancel-button").on("click", function () {
            displayProducts(allProducts); // Return to products grid
        });
        $("#remove-button").on("click", function () {
            removeProductFromFirebase(product.id);
        });
    }

    function removeProductFromFirebase(productId) {
        db.collection("products").doc(productId).delete()
            .then(() => {
                console.log("Product removed successfully!");
                showModalMessage("Product Removed Successfully!", true);
                fetchProducts().then((products) => {
                    allProducts = products;
                    displayProducts(products); // Refresh product list
                });
            })
            .catch(error => {
                console.error("Error removing product:", error);
            });
    }

    fetchProducts().then((products) => {
        allProducts = products;

        $(".search-bar").on("input", function () {
            let searchText = $(this).val().toLowerCase().trim();
            let filtered = allProducts.filter(product =>
                product.label.toLowerCase().includes(searchText)
            );

            displayProducts(filtered);
        });

        displayProducts(products); // Initial display
    });
});
//---------------//

//Customers Section//
function initCustomersPage() {

    const mainContent = document.querySelector(".main-content");

    mainContent.innerHTML = `
            <div class="customers-grid" id="customers-grid"></div>
            <div class="search-customer-container search-container-main">
                <input type="text" class="search-bar" id="search-customers" placeholder="Search Customer"/>
                <img src="icons/magnifying-glass-solid.svg" width="24" height="24" alt="Search" class="search-icon" />
            </div>
        `;
    fetchCustomers();
}

async function fetchCustomers() {
    const searchInput = document.getElementById("search-customers");
    const customersGrid = document.getElementById("customers-grid");


    searchInput.addEventListener("input", async () => {
        const searchValue = searchInput.value.trim().toLowerCase();

        // Search Fetch
        try {
            // Fetch all customers from Firebase
            const customersSnapshot = await db.collection("customers").get();

            // Filter customers based on the search input value
            const filteredCustomers = [];
            customersSnapshot.forEach((doc) => {
                const customer = { id: doc.id, ...doc.data() }; // Fix: Include document ID
                const name = customer.name.toLowerCase();
                const phoneNumber = customer.phoneNumber.toLowerCase();

                if (name.includes(searchValue) || phoneNumber.includes(searchValue)) {
                    filteredCustomers.push(customer);
                }
            });

            // Clear the current grid before rendering new content
            customersGrid.innerHTML = "";

            if (filteredCustomers.length > 0) {
                filteredCustomers.forEach((customer) => {
                    // Create a customer card for each filtered customer
                    const customerCard = document.createElement("div");
                    customerCard.classList.add("customers-card");
                    customerCard.innerHTML = `
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-phone">${customer.phoneNumber}</div>
                    `;
                    customerCard.addEventListener("click", () => {
                        displayCustomerDetails(customer.id, customer.name, customer.phoneNumber);
                    });
                    customersGrid.appendChild(customerCard);
                });
            } else {
                customersGrid.innerHTML = "<p>No customers found.</p>";
            }
        } catch (error) {
            customersGrid.innerHTML = `<p>Error fetching customers: ${error.message}</p>`;
        }
    });

    // Initial Fetch
    try {
        const customersSnapshot = await db.collection("customers").get();
        customersGrid.innerHTML = ""; // Clear previous content

        customersSnapshot.forEach((doc) => {
            const customer = { id: doc.id, ...doc.data() }; // Fix: Include document ID

            // Create a customer card for each customer
            const customerCard = document.createElement("div");
            customerCard.classList.add("customers-card");
            customerCard.innerHTML = `
                <div class="customer-name">${customer.name}</div>
                <div class="customer-phone">${customer.phoneNumber}</div>
            `;
            customerCard.addEventListener("click", () => {
                console.log("Customer ID:", customer.id);
                displayCustomerDetails(customer.id, customer.name, customer.phoneNumber);
            });
            customersGrid.appendChild(customerCard);
        });
    } catch (error) {
        customersGrid.innerHTML = `<p>Error fetching customers: ${error.message}</p>`;
    }
}

function showCustomerForm() {
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
            <h1>Add Customer</h1>
            <form id="customer-form" class="product-form">
                <label for="name">Name: </label>
                <input type="text" id="name" name="name" required><br>

                <label for="phoneNumber">Phone Number: </label>
                <input type="number" id="phoneNumber" name="phoneNumber" required><br>

                <button type="submit">Add</button>
            </form>
        `;

    const customerForm = document.getElementById("customer-form");

    customerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        addCustomer();
    });

}
async function addCustomer() {
    const name = document.getElementById("name").value.trim().toLowerCase();
    const phoneNumber = document.getElementById("phoneNumber").value.trim().toLowerCase();


    const phoneNumberRegex = /^[0-9]+$/;
    if (!phoneNumberRegex.test(phoneNumber)) {
        showModalMessage("Invalid input, please try again!", false);
        return;
    }

    try {
        const customersSnapshot = await db.collection("customers").get();
        let nameExists = false;
        let phoneNumberExists = false;

        customersSnapshot.forEach((doc) => {
            const customer = doc.data();


            if (customer.name.toLowerCase() === name.toLowerCase()) {
                nameExists = true;
            }
            if (customer.phoneNumber === phoneNumber) {
                phoneNumberExists = true;
            }
        });

        if (nameExists || phoneNumberExists) {
            let errorMessage = "Failed to add customer: ";
            if (nameExists && phoneNumberExists) {
                errorMessage += "Name and Phone Number already exist!";
            } else if (nameExists) {
                errorMessage += "Name already exist!";
            } else if (phoneNumberExists) {
                errorMessage += "Phone Number already exist!";
            }
            showModalMessage(errorMessage, false);
        } else {
            await db.collection("customers").add({ name, phoneNumber });
            showModalMessage("Customer added successfully!", true);
            const customerForm = document.getElementById("customer-form");
            customerForm.reset();
        }
    } catch (error) {
        showModalMessage(`Error checking for duplicates: ${error.message}`, false);
    }
}

function displayCustomerDetails(customerId, customerName, customerPhone) {

    const mainContent = document.querySelector(".main-content");

    mainContent.innerHTML = `
        <form id="customer-form" class="product-form">
            <label for="customer-name">Name:</label>
            <input type="text" id="customer-name" placeholder="${customerName}" value="${customerName}" required /><br />

            <label for="customer-phone">Phone Number:</label>
            <input type="text" id="customer-phone" placeholder="${customerPhone}" value="${customerPhone}" required /><br />

            <button type="button" id="edit-customer-btn">Edit Customer</button>
            <button type="button" id="remove-customer-btn">Remove Customer</button>
            <button type="button" id="cancel-customer-btn">Go Back</button>
        </form>

        <div id="customer-table" class="customer-table">
            <p>Table Placeholder</p>
        </div>
    `;


    const editBtn = document.getElementById("edit-customer-btn");
    const removeBtn = document.getElementById("remove-customer-btn");
    const cancelBtn = document.getElementById("cancel-customer-btn");

    editBtn.addEventListener("click", async () => {
        const updatedName = document.getElementById("customer-name").value.trim();
        const updatedPhone = document.getElementById("customer-phone").value.trim();
        try {

            const customersSnapshot = await db.collection("customers").get();
            let nameExists = false;
            let phoneNumberExists = false;

            customersSnapshot.forEach((doc) => {
                const customer = doc.data();


                if (customer.name.toLowerCase() === updatedName.toLowerCase()) {
                    nameExists = true;
                }
                if (customer.phoneNumber === updatedPhone) {
                    phoneNumberExists = true;
                }
            });

            if (nameExists || phoneNumberExists) {
                let errorMessage = "Failed to update customer: ";
                if (nameExists && phoneNumberExists) {
                    errorMessage += "Name and Phone Number already exist!";
                } else if (nameExists) {
                    errorMessage += "Name already exist!";
                } else if (phoneNumberExists) {
                    errorMessage += "Phone Number already exist!";
                }
                showModalMessage(errorMessage, false);
            }
            else {
                await db.collection("customers").doc(customerId).update({
                    name: updatedName,
                    phoneNumber: updatedPhone,
                });
                showModalMessage("Customer Edited Successfully!", true);
            }
        } catch (error) {
            alert(`Error updating customer: ${error.message}`);
        }
    });

    removeBtn.addEventListener("click", async () => {
        try {
            await db.collection("customers").doc(customerId).delete();
            showModalMessage("Customer removed successfully!", true);
            setTimeout(() => {
                const viewCustomersBtn = document.getElementById("view-customers-btn");
                viewCustomersBtn.click();
            }, 10);
        } catch (error) {
            console.error(`Error removing customer: ${error.message}`);
        }
    });

    cancelBtn.addEventListener("click", async () => {
        setTimeout(() => {
            const viewCustomersBtn = document.getElementById("view-customers-btn");
            viewCustomersBtn.click();
        }, 10);
    });
}
//----------------//

function toggleSidebar() {
    document.getElementById("sidebar").classList.add("show");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("show");
}

let initialBaseColor, initialTextColor, initialInputColor, initialAccentColor;
function toggleTheme() {
    const root = document.documentElement;

    if (!initialBaseColor) {
        initialBaseColor = getComputedStyle(root)
            .getPropertyValue("--accent-color")
            .trim();
        initialTextColor = getComputedStyle(root)
            .getPropertyValue("--text-color")
            .trim();
        initialInputColor = getComputedStyle(root)
            .getPropertyValue("--input-color")
            .trim();
        initialAccentColor = getComputedStyle(root)
            .getPropertyValue("--accent-color")
            .trim();
    }

    const baseColor = getComputedStyle(root).getPropertyValue("--accent-color").trim();

    if (baseColor === initialBaseColor) {
        root.style.setProperty("--accent-color", "rgb(10, 123, 168)");
        root.style.setProperty("--input-color", "rgb(255, 255, 255)");
        document.body.style.backgroundImage = `url('../images/background9.jpg')`;
    } else {
        root.style.setProperty("--accent-color", initialBaseColor);
        root.style.setProperty("--text-color", initialTextColor);
        root.style.setProperty("--input-color", initialInputColor);
        root.style.setProperty("--accent-color", initialAccentColor);
        document.body.style.backgroundImage = `url('../images/background10.png')`;
    }
}

function openFeedbackModal() {
    document.getElementById("feedback-modal").style.display = "flex";
}

function submitFeedback() {
    const feedbackText = document.getElementById("feedback-text").value;
    const feedbackMessage = document.getElementById("feedback-message");

    if (feedbackText.trim()) {
        feedbackMessage.textContent = "Thank you for your feedback!";
        feedbackMessage.style.color = "green";
        setTimeout(() => {
            document.getElementById("feedback-modal").style.display = "none";
            feedbackMessage.textContent = "";
            document.getElementById("feedback-text").value = "";
        }, 3000);
    } else {
        feedbackMessage.textContent = "Please enter your feedback!";
        feedbackMessage.style.color = "red";
    }
}
function showModalMessage(message, isSuccess) {
    // Create modal container
    const modalContainer = document.createElement("div");
    modalContainer.style.position = "fixed";
    modalContainer.style.top = "0";
    modalContainer.style.left = "0";
    modalContainer.style.width = "100%";
    modalContainer.style.height = "100%";
    modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modalContainer.style.display = "flex";
    modalContainer.style.justifyContent = "center";
    modalContainer.style.alignItems = "center";
    modalContainer.style.zIndex = "1000";

    // Create modal box
    const modalBox = document.createElement("div");
    modalBox.style.backgroundColor = "#fff";
    modalBox.style.padding = "20px";
    modalBox.style.borderRadius = "10px";
    modalBox.style.textAlign = "center";
    modalBox.style.width = "80%";
    modalBox.style.maxWidth = "400px";

    // Add message text
    const messageText = document.createElement("p");
    messageText.textContent = message;
    messageText.style.color = isSuccess ? "green" : "red";
    messageText.style.fontSize = "16px";
    messageText.style.fontWeight = "bold";
    messageText.style.marginBottom = "20px";

    // Add OK button
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.style.padding = "10px 20px";
    okButton.style.backgroundColor = isSuccess ? "green" : "red";
    okButton.style.color = "#fff";
    okButton.style.border = "none";
    okButton.style.borderRadius = "5px";
    okButton.style.cursor = "pointer";
    okButton.style.fontSize = "16px";

    okButton.addEventListener("click", () => {
        modalContainer.remove();
    });

    // Append elements
    modalBox.appendChild(messageText);
    modalBox.appendChild(okButton);
    modalContainer.appendChild(modalBox);

    // Append modal to the body
    document.body.appendChild(modalContainer);
}

async function exportToPDF(data) {
    try {
        const { jsPDF } = window.jspdf; // Ensure jsPDF is loaded from the CDN
        const pdf = new jsPDF();

        // Add title
        pdf.setFontSize(16);
        pdf.text("Product List", 10, 10);

        // Define table headers and rows
        const columns = ["Label", "Barcode", "Price ($)", "Category", "Stock", "Created At"];
        const rows = data.map(product => [
            product.label,
            product.barcode,
            product.price.toFixed(2),
            product.category,
            product.stock,
            product.createdAt
        ]);

        // Use autoTable to create the table
        pdf.autoTable({
            head: [columns],
            body: rows,
            startY: 20, // Start below the title
        });

        // Save the PDF
        pdf.save("product-list.pdf");
    } catch (error) {
        console.error("Error exporting to PDF:", error);
    }
}

async function fetchProductsforExporting() {
    try {
        const snapshot = await db.collection("products").get();
        const products = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                label: data.label,
                barcode: data.barcode,
                price: data.price,
                category: data.category,
                stock: data.stock,
                createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "Unknown Date"
            };
        });
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeEventListeners();
});