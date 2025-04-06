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

firebase.firestore().enablePersistence()
    .then(() => {
        console.log("Offline mode enabled!");
    })
    .catch((err) => {
        console.error("Failed to enable offline mode:", err);
    });

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/js/sw.js")
        .then(() => console.log("🔥 Service Worker Registered!"))
        .catch((err) => console.error("Service Worker Failed:", err));
}

function updateOnlineStatus() {
    if (navigator.onLine) {
        console.log("You are online!");
    } else {
        console.log("You are offline!");
    }
}

window.addEventListener("load", updateOnlineStatus);
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

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
                removeActive();
                loadContent(section);
            }
        });
        document.getElementById("add-product-btn").addEventListener("click", function () {
            const section = this.getAttribute("data-section");
            if (section) {
                removeActive();
                loadContent(section);
            }
        });
        document.getElementById("add-cart-btn").addEventListener("click", function () {
            const section = this.getAttribute("data-section");
            if (section) {
                removeActive();
                loadContent(section);
            }
        });
        document.getElementById("add-sales-btn").addEventListener("click", function () {
            const section = this.getAttribute("data-section");
            if (section) {
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
        indicator.classList.remove("active-indicator");
        slider.classList.remove("active");
        popButton.classList.remove("active");
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

        //<Bot sections>//
        if (section === "products")
            initProductPage();
        if (section === "customers")
            initCustomersPage();
        if (section === "cartAndSales")
            initCartAndSalesSection();
        //<Pop sections>//
        if (section === "addProduct")
            showProductForm();
        if (section === "addCustomer")
            showCustomerForm();
        if (section === "addCart")
            showCartForm();
        if (section === "addSales")
            showSalesForm();

    } catch (error) {
        mainContent.innerHTML = `<h2>Error loading ${section}. Please try again later.</h2>`;
        console.error(error);
    }
}


//<Adder Section>//
//>addproduct//
function showProductForm() {
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

            <label for="costPrice">Cost Price($): </label>
            <input type="number" id="costPrice" name="costPrice" ><br>

            <label for="profit">Profit($): </label>
            <input type="number" id="profit" name="profit" ><br>

            <label for="category">Category: </label>
            <input type="text" id="category" name="category"><br>

            <label for="stock">Stock Quantity: </label>
            <input type="number" id="stock" name="stock" ><br>

            <button type="submit">Add</button>
        </form>
    `;
    addProduct();
    document.getElementById("customFileButton").addEventListener("click", () => {
        document.getElementById("img").click();
    });
    document.getElementById("img").addEventListener("change", (event) => {
        const fileName = event.target.files[0]?.name || "No file selected";
        document.getElementById("fileName").textContent = `Selected: ${fileName}`;
    });
}
async function addProduct() {
    const form = document.getElementById("product-form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        showLoadingOverlay(1500);
        const formData = new FormData(form);
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
                console.time("ImageResizeAndUpload");
                const resizedImage = await convertToJPEG(imageFile);
                const storageRef = storage.ref();
                const imageRef = storageRef.child(`product-images/${imageFile.name}`);
                await imageRef.put(resizedImage);
                imgUrl = await imageRef.getDownloadURL();
                console.timeEnd("ImageResizeAndUpload");
            } catch (error) {
                console.error("Image upload failed:", error);
                showModalMessage("Image upload failed. Please try again.", false);
                return;
            }
        }

        const productData = {
            barcode: formData.get("barcode"),
            label: formData.get("label").toLowerCase(),
            img: imgUrl,
            costPrice: parseFloat(formData.get("costPrice")),
            profit: parseFloat(formData.get("profit")),
            category: formData.get("category"),
            stock: parseInt(formData.get("stock"), 10),
        };

        if (
            !productData.barcode ||
            !productData.label ||
            isNaN(productData.costPrice) ||
            isNaN(productData.profit) ||
            isNaN(productData.stock) ||
            !formData.get("img")
        ) {
            showModalMessage("Please fill in all required fields, including the product image.", false);
            return;
        }

        try {
            const snapshot = await db.collection("products")
                .where("barcode", "==", productData.barcode)
                .get();

            const labelSnapshot = await db.collection("products")
                .where("label", "==", productData.label)
                .get();

            if (!snapshot.empty || !labelSnapshot.empty) {
                showModalMessage("Item already exists. update or check the item details.", false);
                form.reset();
                return;
            }

            try {
                const docRef = await db.collection("products").add({
                    ...productData,
                    createdAt: firebase.firestore.Timestamp.now()
                });


                const newDoc = await docRef.get();
                const newProductData = newDoc.data();

                allProducts.push({
                    ...newProductData,
                    id: docRef.id,
                    createdAt: newProductData.createdAt.toDate().toLocaleDateString()
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
//>AddCustomer//
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
//>addCart//
function showCartForm() {
    showSales = false;
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
        <form id="cart-form" class="product-form">
            <label for="cartName">Cart Name: (required)</label>
            <input type="text" id="cartName" name="cartName" required><br>
            <button type="submit" class="save-cart-btn" id="save-cart-btn">Create Cart</button>
            <button type="button" class="cancel-cart-btn" id="cancel-cart-btn" style="display: none;">Cancel Cart</button>
        </form>
        <div class="search-customer-container search-container-main" >
            <input type="text" class="search-bar" id="search-customers" disabled placeholder="Search Product to add"/>
            <img src="icons/magnifying-glass-solid.svg" width="24" height="24" alt="Search" class="search-icon"/>
        </div>
        <div class="cart-products-container" id="cart-products-container"></div>
        <div class="cart-display-container" id="cart-display-container" style="display: none"></div>
    `;
    fetchProductToAdd();

    const cartForm = document.getElementById("cart-form");
    cartForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const saveCartBtn = document.getElementById("save-cart-btn");
        const cancelCartBtn = document.getElementById("cancel-cart-btn");
        const cartName = document.getElementById("cartName");

        saveCartBtn.remove();
        cancelCartBtn.style.display = "inline-block";
        cancelCartBtn.style.color = "red";
        cartName.disabled = true;

        try {
            showLoadingOverlay(1500);
            await addCart();
            document.getElementById("search-customers").disabled = false;
        } catch (error) {
            console.error("Error adding cart:", error);
            cancelCartBtn.style.display = "none";
            cartName.disabled = false;
        }
    });

    const cancelCartBtn = document.getElementById("cancel-cart-btn");
    cancelCartBtn.addEventListener("click", cancelCart);
}
async function cancelCart() {
    try {
        // Reference to the current cart document
        const cartDocRef = db.collection("carts").doc(currentCartId);
        const cartProductsSnapshot = await cartDocRef.collection("cartProducts").get();

        // For each product in the cart, reverse the sales entry in the sales collection.
        // It assumes that each cart product document has a "productId" and a "quantity" field.
        for (let doc of cartProductsSnapshot.docs) {
            const data = doc.data();
            const productId = data.productId || doc.id; // Adjust this if necessary
            const quantity = data.quantity || 1;

            // For each unit added in the cart, call cancelSale once.
            for (let i = 0; i < quantity; i++) {
                cancelSale(productId, null);
            }
        }

        // Now delete all cart product documents in a batch operation.

        cartDocRef.delete();

        // Clear the current cart ID and update the UI.
        currentCartId = null;
        showCartForm();
    } catch (error) {
        console.error("Error canceling cart:", error);
    }
}
let currentCartId = null;
async function addCart() {
    const cartName = document.getElementById("cartName").value.trim();
    if (!cartName) {
        showModalMessage("Please enter cart name to add a cart", false);
        return;
    }

    const cartRef = db.collection("carts").doc();
    const cartData = {
        name: cartName,
        dateCreated: firebase.firestore.Timestamp.now(),
        totalCost: 0
    };

    try {
        await cartRef.set(cartData);
        // Store the cart ID globally
        currentCartId = cartRef.id;
        displayCart(cartRef.id);
    } catch (error) {
        console.error("Error adding cart:", error);
    }
}
async function displayCart(cartId) {
    const cartDisplayContainer = document.getElementById("cart-display-container");
    setTimeout(() => {
        cartDisplayContainer.style.display = "block";
    }, 1300);
    cartDisplayContainer.innerHTML = `
        <div class="cart-details" id="cart-details"></div>
        <div class="cart-products-list-container" id="cart-products-list-container"></div>
    `;

    db.collection("carts").doc(cartId).onSnapshot(doc => {
        if (doc.exists) {
            const cart = doc.data();
            document.getElementById("cart-details").innerHTML = `
                <p style="font-weight: bold; text-decoration: underline;">Cart Name: ${cart.name}</p>
                <p><strong>Date Created: </strong>${cart.dateCreated.toDate().toLocaleString()}</p>
                <p><strong>Total Cost: </strong>$${cart.totalCost.toFixed(2)}</p>
            `;
        }
    });

    db.collection("carts").doc(cartId).collection("cartProducts").onSnapshot(snapshot => {
        let cartProductsHTML = "";

        snapshot.forEach(doc => {
            const product = doc.data();
            cartProductsHTML += `
                <div class="cart-products-list">
                    <p style="font-weight: bold; text-decoration: underline;">${product.name}</p>
                    <p><strong>Quantity: </strong>${product.quantity}</p>
                    <p><strong>costPrice: $</strong>${product.costPrice}</p>
                    <p><strong>Total: $</strong>${product.total}</p>
                </div>
            `;
        });

        const cartProductsList = document.getElementById("cart-products-list-container");
        if (cartProductsList) {
            cartProductsList.innerHTML = cartProductsHTML;

            if (!snapshot.empty) {
                let exportBtn = document.getElementById("export-cart");
                if (!exportBtn) {
                    exportBtn = document.createElement("button");
                    exportBtn.id = "export-cart";
                    exportBtn.className = "export-product-btn";
                    exportBtn.textContent = "Export Cart";
                    exportBtn.style.padding = "20px";
                    exportBtn.addEventListener("click", exportCartToPDF);
                    cartDisplayContainer.appendChild(exportBtn);
                }
            } else {
                const existingExportBtn = document.getElementById("export-cart");
                if (existingExportBtn) {
                    existingExportBtn.remove();
                }
            }
        } else {
            console.error("cart-products-list container not found!");
        }
    });
}
async function addToCart(productId, label, costPrice) {
    if (!currentCartId) {
        console.error("No active cart found");
        return;
    }

    const cartDoc = db.collection("carts").doc(currentCartId);
    const cartProductsRef = cartDoc.collection("cartProducts").doc(productId);
    const productSnap = await cartProductsRef.get();

    if (productSnap.exists) {
        const productData = productSnap.data();
        await cartProductsRef.update({
            quantity: productData.quantity + 1,
            total: (productData.quantity + 1) * costPrice
        });
    } else {
        await cartProductsRef.set({
            name: label,
            quantity: 1,
            costPrice: costPrice,
            total: costPrice
        });
    }

    const cartProducts = await cartDoc.collection("cartProducts").get();
    let totalCost = 0;
    cartProducts.forEach(doc => {
        totalCost += doc.data().total;
    });
    await cartDoc.update({ totalCost });
}
function animateImageToCart(sourceImageElement) {
    const cartIcon = document.getElementById("cart-icon");
    if (!cartIcon) {
        console.error("Cart icon element not found.");
        return;
    }

    // Clone the source image
    const flyingImage = sourceImageElement.cloneNode(true);
    flyingImage.classList.add("flying-cart-image");
    document.body.appendChild(flyingImage);

    // Get starting position of the source image
    const startRect = sourceImageElement.getBoundingClientRect();
    flyingImage.style.left = `${startRect.left}px`;
    flyingImage.style.top = `${startRect.top}px`;
    flyingImage.style.width = `${startRect.width}px`;
    flyingImage.style.height = `${startRect.height}px`;

    // Get target position (cart icon)
    const targetRect = cartIcon.getBoundingClientRect();

    // Calculate translation distances
    const translateX = targetRect.left - startRect.left - 50;
    const translateY = targetRect.top - startRect.top - 15;

    // Force reflow before applying the transform
    flyingImage.offsetWidth;

    // Apply transformation: translate, shrink, and rotate
    const scaleFactor = 0; // Adjust if necessary

    flyingImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleFactor}) rotate(360deg)`;

    // Remove the clone after the animation completes
    flyingImage.addEventListener("transitionend", () => {
        flyingImage.remove();
    });
}
//>addSales//
let showSales = false;
function showSalesForm() {
    showSales = true;
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
        <div class="search-customer-container search-container-main" >
            <input type="text" class="search-bar" id="search-customers" placeholder="Search Product To Add"/>
            <img src="icons/magnifying-glass-solid.svg" width="24" height="24" alt="Search" class="search-icon"/>
        </div>
        <div class="cart-products-container" id="cart-products-container"></div>
    `;
    fetchProductToAdd();
}
async function fetchProductToAdd() {
    const searchInput = document.getElementById("search-customers");
    const productCardContainer = document.getElementById("cart-products-container");

    if (!productCardContainer) {
        console.error("Product container not found.");
        return;
    }

    try {
        // Fetch all products initially
        const querySnapshot = await db.collection("products").orderBy("label").get();
        let allProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        function displayProducts(filteredProducts) {
            productCardContainer.innerHTML = ""; // Clear previous content

            if (filteredProducts.length === 0) {
                productCardContainer.innerHTML = `
                <div class="no-products-message">
                    No products found. Check Product name!
                </div>
                `;
                return;
            }

            filteredProducts.forEach(product => {
                displayProductToAdd(product, product.id);
            });
        }


        // Display all products initially
        if (showSales)
            displayProducts(allProducts);

        // Listen for search input changes
        searchInput.addEventListener("input", function () {
            const searchValue = searchInput.value.toLowerCase();
            const filteredProducts = allProducts.filter(product =>
                product.label.toLowerCase() === searchValue
            );
            displayProducts(filteredProducts); // Show filtered products
        });

    } catch (error) {
        console.error("Error fetching products:", error);
    }
}
function displayProductToAdd(product, productId) {
    const productCardContainer = document.getElementById("cart-products-container");
    if (!productCardContainer) {
        console.error("Product display container not found.");
        return;
    }

    // Decide which action to use for the main button
    const actionText = showSales ? "Add to Sales" : "Add to Cart";
    const actionFunction = showSales ? addToSales : addToCart;

    // Create product card element
    const productCard = document.createElement("div");
    productCard.classList.add("cart-product-card");
    productCard.innerHTML = `
        <div class="left">
            <img src="${product.img}" alt="${product.label}" width="100" height="100">
        </div>
        <div class="right">
            <button type="submit" class="add-to-cart-btn">${actionText}</button>
            ${showSales ? `<button type="button" class="cancel-sale-btn">Cancel Sale</button>` : ""}
        </div>
        ${!showSales ?
            `<div class="cart-img-container">
            <img src="images/cartImage.PNG" id="cart-icon" alt="Buy Logo" width="100" height="100" class="buy-logo">
        </div>` : ""}
    `;


    const actionBtn = productCard.querySelector(".add-to-cart-btn");

    actionBtn.addEventListener("click", function () {
        console.log('product profit', product.profit);
        actionFunction(productId, product.label, product.costPrice, product.profit);
        if (!showSales) {
            addToSales(productId, product.label, product.costPrice, product.profit);
            const productImage = productCard.querySelector("img");
            animateImageToCart(productImage);
        }
        else {
            showLoadingOverlay(1500);
        }
    });

    if (showSales) {
        const cancelBtn = productCard.querySelector(".cancel-sale-btn");
        cancelBtn.addEventListener("click", async function () {
            showLoadingOverlay();
            await cancelSale(productId);
        });
    }

    productCardContainer.appendChild(productCard);
}
async function addToSales(productId, productLabel, productPrice, productProfit) {
    try {

        const today = new Date();
        const dateString = today.toISOString().split("T")[0];
        const salesDocRef = db.collection("sales").doc(dateString);
        const productRef = db.collection("products").doc(productId);

        const salesDoc = await salesDocRef.get();
        let totalProductsSold = salesDoc.exists ? (salesDoc.data().totalProductsSold || 0) : 0;
        let totalRevenue = salesDoc.exists ? (salesDoc.data().totalRevenue || 0) : 0;
        let totalProfit = salesDoc.exists ? (salesDoc.data().totalProfit || 0) : 0;

        const productSoldRef = salesDocRef.collection("productsSold").doc(productId);
        const productSoldDoc = await productSoldRef.get();

        let newQuantity = productSoldDoc.exists ? productSoldDoc.data().quantity + 1 : 1;
        let newTotal = newQuantity * productPrice;
        let newProfit = newQuantity * productProfit;

        await productSoldRef.set({
            name: productLabel,
            quantity: newQuantity,
            costPrice: productPrice,
            profit: productProfit,
            totalRevenu: newTotal,
            totalProfit: newProfit,
            dateSold: firebase.firestore.Timestamp.now()
        });

        await salesDocRef.set({
            totalProductsSold: totalProductsSold + 1,
            totalRevenue: totalRevenue + productPrice,
            totalProfit: totalProfit + productProfit,
        }, { merge: true });

        const productDoc = await productRef.get();
        if (productDoc.exists) {
            const newStock = Math.max(0, (productDoc.data().stock || 0) - 1);
            await productRef.update({ stock: newStock });
        }

    } catch (error) {
        console.error("Error adding to sales:", error);
    }
}
async function cancelSale(productId) {
    try {
        const today = new Date();
        const dateString = today.toISOString().split("T")[0];
        const salesDocRef = db.collection("sales").doc(dateString);
        const productRef = db.collection("products").doc(productId);
        const productSoldRef = salesDocRef.collection("productsSold").doc(productId);


        const productSoldDoc = await productSoldRef.get();
        if (!productSoldDoc.exists) {
            console.log("No sale record found for this product today.");
            return;
        }

        const productData = productSoldDoc.data();
        const currentQuantity = productData.quantity;
        const productPrice = productData.costPrice;
        const productProfit = productData.profit;

        if (currentQuantity > 1) {

            const newQuantity = currentQuantity - 1;
            const newTotal = newQuantity * productPrice;
            const newProfit = newQuantity * productProfit;

            await productSoldRef.set({
                name: productData.name,
                quantity: newQuantity,
                costPrice: productPrice,
                profit: productProfit,
                totalRevenu: newTotal,
                totalProfit: newProfit,
                dateSold: firebase.firestore.Timestamp.now()
            });
            console.log("Decremented product sale record by one unit.");
        } else {
            await productSoldRef.delete();
            showModalMessage(`Product sale record deleted as quantity sold reached zero.
                <p style='color: red;'>Canceling this item now will reduce the product stock!!</p>`, true);
            showSalesForm();
        }


        const salesDoc = await salesDocRef.get();
        if (salesDoc.exists) {
            const salesData = salesDoc.data();
            const newTotalProductsSold = Math.max(0, (salesData.totalProductsSold || 0) - 1);
            const newTotalRevenue = Math.max(0, (salesData.totalRevenue || 0) - productPrice);
            const newTotalProfit = Math.max(0, (salesData.totalProfit || 0) - productProfit);
            await salesDocRef.set({
                totalProductsSold: newTotalProductsSold,
                totalRevenue: newTotalRevenue,
                totalProfit: newTotalProfit
            }, { merge: true });
            console.log("Sales document updated.");
        }

        // Restore one unit of stock in the products collection
        const productDoc = await productRef.get();
        if (productDoc.exists) {
            const productStock = productDoc.data().stock || 0;
            const updatedStock = productStock + 1;
            await productRef.update({ stock: updatedStock });
            console.log("Product stock restored. New stock:", updatedStock);
        } else {
            console.error("Product not found in products collection.");
        }
    } catch (error) {
        console.error("Error canceling sale:", error);
    }
}
function showLoadingOverlay(duration = 900) {
    return new Promise((resolve) => {
        const overlay = document.getElementById("loading-overlay");
        const progressBar = document.getElementById("progress-bar");

        overlay.style.display = "flex";
        overlay.style.opacity = "0";
        progressBar.style.width = "0%";
        void overlay.offsetWidth;

        overlay.style.opacity = "1";
        setTimeout(() => {
            progressBar.style.width = "100%";
        }, 50);

        setTimeout(() => {
            overlay.style.opacity = "0";
            setTimeout(() => {
                overlay.style.display = "none";
                resolve(); // Animation complete
            }, 10); // Fade-out time
        }, duration);
    });
}
//-------------//


//<Products Section>//
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
                <label for="sort-select">Sort by Cost Price:</label>
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
            <button class="export-product-btn" id="export-product-btn">EXPORT PRODUCTS</button>
        </div>
        <div id="products-grid" class="products-grid"></div>
    `;
    fetchProducts();

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
                    sortOrder === "asc" ? a.costPrice - b.costPrice : b.costPrice - a.costPrice
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
                        <p><strong>Cost Price:</strong> $${product.costPrice.toFixed(2)}</p>
                        <p><strong>Profit</strong> $${product.profit.toFixed(2)}</p>
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
let allProducts = [];
$(document).ready(function () {

    function fetchProducts() {
        return db.collection("products").get().then((querySnapshot) => {
            let products = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                products.push({
                    id: doc.id,
                    label: data.label,
                    barcode: data.barcode,
                    costPrice: data.costPrice || 0,
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
                <p><strong>Cost Price:</strong> $${product.costPrice.toFixed(2)}</p>
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
                
                <label for="costPrice">Cost Price:</label>
                <input type="number" id="costPrice" name="costPrice" value="${product.costPrice}">

                <label for="profit">Profit: </label>
                <input type="number" id="profit" name="profit" value="${product.profit}">
                
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
                costPrice: parseFloat($("#costPrice").val()),
                profit: parseFloat($("profit").val()),
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
                product.label.toLowerCase() === (searchText)
            );

            displayProducts(filtered);
        });

        displayProducts(products); // Initial display
    });
}); //<--------------->//


//<Customers Section>//
function initCustomersPage() {

    const mainContent = document.querySelector(".main-content");

    mainContent.innerHTML = `
            <div class="search-customer-container search-container-main">
                <input type="text" class="search-bar" id="search-customers" placeholder="Search Customer"/>
                <img src="icons/magnifying-glass-solid.svg" width="24" height="24" alt="Search" class="search-icon" />
            </div>
            <div class="customers-grid" id="customers-grid"></div>
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
async function displayCustomerDetails(customerId, customerName, customerPhone) {
    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = `
        <form id="customer-form" class="product-form">
            <label for="customer-name">Name:</label>
            <input type="text" id="customer-name" value="${customerName}" required /><br />

            <label for="customer-phone">Phone Number:</label>
            <input type="text" id="customer-phone" value="${customerPhone}" required /><br />

            <button type="button" id="edit-customer-btn">Edit Customer</button>
            <button type="button" id="remove-customer-btn">Remove Customer</button>
            <button type="button" id="cancel-customer-btn">Go Back</button>
        </form>

        <div id="customer-table" class="customer-table">
            <p>Customer's Debt</p>
            <table>
                <thead>
                    <tr>
                        <th>Details</th>
                        <th>Balance</th>
                        <th>Created At</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody id="debt-details-table"></tbody>
            </table>
            <p><strong>Total Balance: <span id="total-balance">0</span></strong></p>
            <div class="debt-actions" id="debt-actions">
                <button type="button" class="add-debt" id="add-debt">Add</button>
                <button type="button" class="export" id="export">Export</button>
            </div>
        </div>
    `;

    document.getElementById("export").addEventListener("click", async () => {
        try {
            const { debts, total } = await fetchDebtDetailsForExport(customerId);
            exportDebtDetailsToPDF(debts, customerName, customerPhone, total);
        } catch (error) {
            console.error("Error exporting debt details:", error);
        }
    });


    async function loadDebts() {
        const debtDetailsTable = document.getElementById("debt-details-table");
        const totalBalanceElement = document.getElementById("total-balance");
        const debtRef = db.collection("customers").doc(customerId).collection("debts");
        const debtsSnapshot = await debtRef.get();
        let totalBalance = 0;

        debtDetailsTable.innerHTML = '';

        debtsSnapshot.forEach((doc) => {
            const debt = doc.data();
            const debtRow = document.createElement("tr");

            debtRow.innerHTML = `
                <td>${debt.details}</td>
                <td>${debt.balance}</td>
                <td>${new Date(debt.createdAt.seconds * 1000).toLocaleString()}</td>
                <td><button class="remove-debt-btn" data-debt-id="${doc.id}">Remove</button></td>
            `;
            debtDetailsTable.appendChild(debtRow);
            totalBalance += debt.balance;
        });
        totalBalanceElement.textContent = totalBalance;

        document.querySelectorAll(".remove-debt-btn").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const debtId = event.target.getAttribute("data-debt-id");
                await db.collection("customers").doc(customerId).collection("debts").doc(debtId).delete();
                loadDebts();
                showModalMessage("Debt removed successfully!", true);
            });
        });
    }

    await loadDebts();

    document.getElementById("edit-customer-btn").addEventListener("click", async () => {
        const updatedName = document.getElementById("customer-name").value.trim();
        const updatedPhone = document.getElementById("customer-phone").value.trim();

        try {
            await db.collection("customers").doc(customerId).update({ name: updatedName, phoneNumber: updatedPhone });
            showModalMessage("Customer Edited Successfully!", true);
        } catch (error) {
            showModalMessage(`Error updating customer: ${error.message}`, false);
        }
    });

    document.getElementById("remove-customer-btn").addEventListener("click", async () => {
        try {
            setTimeout(() => initCustomersPage(), 10);
            await db.collection("customers").doc(customerId).delete();
        } catch (error) {
            showModalMessage(`Error removing customer: ${error.message}`, false);
        }
    });

    document.getElementById("cancel-customer-btn").addEventListener("click", () => {
        initCustomersPage();
    });

    document.getElementById("add-debt").addEventListener("click", () => {
        mainContent.innerHTML = `
            <form id="customer-debt" class="product-form">
                <label for="debt-details">Details:</label>
                <input type="text" id="debt-details" required /><br />
                <label for="debt-balance">Balance:</label>
                <input type="number" id="debt-balance" required /><br />
                <button type="submit">Add</button>
                <button type="button" id="cancel-debt-btn">Go Back</button>
            </form>
        `;

        document.getElementById("customer-debt").addEventListener("submit", async (event) => {
            event.preventDefault();
            const details = document.getElementById("debt-details").value.trim();
            const balance = parseFloat(document.getElementById("debt-balance").value.trim());

            if (!details || isNaN(balance) || balance <= 0) {
                showModalMessage("Invalid input. Please enter valid details and balance!", false);
                return;
            }

            try {
                await db.collection("customers").doc(customerId).collection("debts").add({
                    details,
                    balance,
                    createdAt: firebase.firestore.Timestamp.now(),
                });
                showModalMessage("Debt added successfully!", true);
                document.getElementById("customer-debt").reset();
            } catch (error) {
                showModalMessage(`Error adding debt: ${error.message}`, false);
            }
        });

        document.getElementById("cancel-debt-btn").addEventListener("click", () => {
            displayCustomerDetails(customerId, customerName, customerPhone);
        });
    });
}//<---------------->//


//<CartAndSales Section>//
function initCartAndSalesSection() {
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
        <h2>Sales and Carts</h2>
        <button type="submit" id="view-carts-btn" class="func-btn">View Carts</button>
        <div class="sales-container" id="sales-container"></div>
                            `;
    loadSalesData();

    const viewCartsBtn = document.getElementById("view-carts-btn");
    viewCartsBtn.addEventListener("click", async () => {

        mainContent.innerHTML = `
            <div class="carts-container" id="carts-container">

                <div class="search-customer-container search-container-main" >
                    <input type="text" class="search-bar" id="search-cart" disabled placeholder="Search Cart"/>
                    <img src="icons/magnifying-glass-solid.svg" width="24" height="24" alt="Search" class="search-icon"/>
                </div>

                <div class="carts-table" id="carts-table"></div>
            </div>`;

        const cartsData = await fetchCartsData();
        renderCartsTable(cartsData);
    });
}
//carts sections//
async function fetchCartsData() {
    console.log("Fetching carts data...");
    try {
        const cartsSnapshot = await firebase.firestore().collection("carts").get();
        const carts = [];

        cartsSnapshot.forEach((doc) => {
            const data = doc.data();
            carts.push({
                id: doc.id,
                name: data.name,
                totalCost: data.totalCost,
                dateCreated: data.dateCreated.toDate(), // Convert Firestore Timestamp to JS Date
            });
        });

        console.log(`Fetched ${carts.length} carts.`);
        return carts;
    } catch (error) {
        console.error("Error fetching carts:", error);
        return [];
    }
}
function renderCartsTable(carts) {
    console.log("Rendering carts table...");
    const cartsTable = document.getElementById("carts-table");
    cartsTable.innerHTML = "";

    if (carts.length === 0) {
        cartsTable.innerHTML = "<p>No carts found.</p>";
        return;
    }

    carts.forEach(cart => {
        const cartDiv = document.createElement("div");
        cartDiv.className = "cart-entry";
        cartDiv.dataset.cartId = cart.id;

        const formattedDate = cart.dateCreated.toLocaleDateString();

        cartDiv.innerHTML = `
            <div class="cart-summary">
                <p><strong>Name:</strong> ${cart.name}</p>
                <p><strong>Total Cost:</strong> $${cart.totalCost.toFixed(2)}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
            </div>
            <div class="hidden-products" id="products-${cart.id}">
            </div>
        `;

        // Later we’ll add click listeners to toggle product visibility and fetch
        cartsTable.appendChild(cartDiv);
    });

    console.log("Carts table rendered.");

    setupCartClickListeners();
}
function setupCartClickListeners() {
    const cartEntries = document.querySelectorAll(".cart-entry");

    cartEntries.forEach(cartDiv => {
        cartDiv.addEventListener("click", async () => {
            const cartId = cartDiv.dataset.cartId;
            const productsContainer = document.getElementById(`products-${cartId}`);

            // Toggle visibility
            const isVisible = productsContainer.classList.contains("show");
            if (isVisible) {
                console.log(`Hiding products for cart: ${cartId}`);
                productsContainer.classList.remove("show");
                return;
            }

            // If already loaded once, just show
            if (productsContainer.dataset.loaded === "true") {
                console.log(`Showing cached products for cart: ${cartId}`);
                productsContainer.classList.add("show");

                return;
            }

            console.log(`Fetching products for cart: ${cartId}...`);
            try {
                const productsSnapshot = await firebase.firestore()
                    .collection("carts")
                    .doc(cartId)
                    .collection("cartProducts")
                    .get();

                if (productsSnapshot.empty) {
                    productsContainer.innerHTML = "<p>No products in this cart.</p>";
                } else {
                    const productListHTML = Array.from(productsSnapshot.docs).map(doc => {
                        const p = doc.data();
                        return `
                            <div class="product-item">
                                <p><strong>${p.name}</strong></p>
                                <p>Quantity: ${p.quantity}</p>
                                <p>Cost Price: $${p.costPrice.toFixed(2)}</p>
                                <p>Total: $${p.total.toFixed(2)}</p>
                            </div>
                        `;
                    }).join("");

                    productsContainer.innerHTML = productListHTML;
                }

                productsContainer.classList.add("show");
                productsContainer.dataset.loaded = "true";
                console.log(`Products loaded for cart: ${cartId}`);
            } catch (error) {
                console.error(`Error loading products for cart ${cartId}:`, error);
                productsContainer.innerHTML = "<p>Error loading products.</p>";
            }
        });
    });

    console.log("Cart click listeners set up.");
}
//sales sections//
async function loadSalesData() {
    const salesContainer = document.getElementById("sales-container");

    salesContainer.innerHTML = `
        <div id="filter-sales" class="filter-options"> 
            <div class="filter-group">
                <label for="sales-date-select">Filter by Category:</label> 
                <select id="sales-date-select">
                    <option value="all">All Sales</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="thisYear">This Year</option>
                    <optgroup label="Choose a Specific Date" id="specific-dates-group"></optgroup>
                </select>
            </div>
        </div>
        <div id="sales-table-container"></div>
    `;

    // Get sales data and populate the dropdown
    const salesData = await fetchSalesData();
    populateDropdown(salesData);
    renderSalesTable(salesData);

    // Event Listener for Filtering
    document.getElementById("sales-date-select").addEventListener("change", function () {
        const filterValue = this.value;
        const filteredData = filterSales(salesData, filterValue);
        renderSalesTable(filteredData);
    });
}
async function fetchSalesData() {
    const salesCollection = db.collection("sales");
    const snapshot = await salesCollection.get();
    const salesData = [];

    for (const doc of snapshot.docs) {
        const salesDate = doc.id; // Sales date is the document ID (e.g., "2025-04-02")
        const salesInfo = doc.data();
        const productsSnapshot = await salesCollection.doc(salesDate).collection("productsSold").get();

        const productsSold = productsSnapshot.docs.map(productDoc => ({
            id: productDoc.id,
            ...productDoc.data()
        }));

        salesData.push({
            salesDate,
            createdAt: salesInfo.createdAt,
            totalProductsSold: salesInfo.totalProductsSold,
            totalRevenue: salesInfo.totalRevenue,
            totalProfit: salesInfo.totalProfit,
            productsSold
        });
    }

    return salesData;
}
function populateDropdown(salesData) {
    const optGroup = document.getElementById("specific-dates-group");

    // Clear previous dates if needed
    optGroup.innerHTML = "";

    // Add each salesDate inside the optgroup
    salesData.forEach(sale => {
        const option = document.createElement("option");
        option.value = sale.salesDate;
        option.textContent = sale.salesDate;
        optGroup.appendChild(option);
    });
}
function filterSales(salesData, filterType) {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (filterType === "today") {
        return salesData.filter(sale => sale.salesDate === todayStr);
    }
    if (filterType === "yesterday") {
        return salesData.filter(sale => sale.salesDate === yesterdayStr);
    }
    if (filterType === "thisWeek") {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Get Monday
        return salesData.filter(sale => new Date(sale.salesDate) >= startOfWeek);
    }
    if (filterType === "thisMonth") {
        return salesData.filter(sale => sale.salesDate.startsWith(todayStr.slice(0, 7))); // Match YYYY-MM
    }
    if (filterType === "thisYear") {
        return salesData.filter(sale => sale.salesDate.startsWith(todayStr.slice(0, 4))); // Match YYYY
    }
    if (salesData.some(sale => sale.salesDate === filterType)) {
        return salesData.filter(sale => sale.salesDate === filterType);
    }
    return salesData; // Return all sales if "All Sales" is selected
}
function renderSalesTable(salesData) {
    const container = document.getElementById("sales-table-container");
    container.innerHTML = "";

    if (salesData.length === 0) {
        container.innerHTML = "<p>No sales data available.</p>";
        return;
    }

    salesData.forEach(sale => {
        const table = document.createElement("table");
        table.classList.add("sales-table");
        table.id = "sales-table";

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Product Name</th>
                <th>Date Sold</th>
                <th>Cost Price</th>
                <th>Quantity</th>
                <th>Total Revenue</th>
                <th>Total Profit</th>
            </tr>
        `;

        const tbody = document.createElement("tbody");

        if (sale.productsSold.length > 0) {
            sale.productsSold.forEach(product => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${new Date(product.dateSold.toDate()).toLocaleString()}</td>
                    <td>$${product.costPrice.toFixed(2)}</td>
                    <td>${product.quantity}</td>
                    <td>$${product.totalRevenu.toFixed(2)}</td>
                    <td>$${product.totalProfit.toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `<td colspan="6">No products sold on this date.</td>`;
            tbody.appendChild(emptyRow);
        }

        const tfoot = document.createElement("tfoot");
        tfoot.innerHTML = `
            <tr class="sales-summary">
                <td colspan="3"><strong>Totals:</strong></td>
                <td><strong>${sale.totalProductsSold}</strong></td>
                <td><strong>$${sale.totalRevenue.toFixed(2)}</strong></td>
                <td><strong>$${sale.totalProfit.toFixed(2)}</strong></td>
            </tr>
        `;

        const tableActions = document.createElement("div");
        tableActions.classList.add("table-actions");
        tableActions.id = "table-actions";
        tableActions.innerHTML = `
            <button type="button" class="export-sales">Export</button>
        `;

        table.appendChild(thead);
        table.appendChild(tbody);
        table.appendChild(tfoot);

        container.appendChild(document.createElement("hr"));
        const header = document.createElement("h3");
        header.textContent = `Sales on ${sale.salesDate}`;
        container.appendChild(header);
        container.appendChild(table);
        container.appendChild(tableActions);

        const exportButtons = container.querySelectorAll(".export-sales");
        exportButtons.forEach((button, index) => {
            button.addEventListener("click", event => exportSalesTableToPDF(event, index));
        });
    });
}//<--------------->//


//<Aside Section>//
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
    messageText.innerHTML = message;
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
}//<--------------->//


//*Exporting Functions*//
async function exportToPDF(data) {
    try {
        const { jsPDF } = window.jspdf; // Ensure jsPDF is loaded from the CDN
        const pdf = new jsPDF();

        pdf.setFillColor(255, 255, 255); // RGB color
        pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');

        // Add title
        pdf.setFontSize(16);
        pdf.text("Products List", 10, 10);

        // Define table headers and rows
        const columns = ["Label", "Barcode", "Cost Price ($)", "Profit ($)", "Category", "Stock", "Created At"];
        const rows = data.map(product => [
            product.label,
            product.barcode,
            product.costPrice.toFixed(2),
            product.profit.toFixed(2),
            product.category,
            product.stock,
            product.createdAt
        ]);

        pdf.autoTable({
            head: [columns],
            body: rows,
            startY: 20,
            theme: "grid",
            styles: {
                valign: "middle",
                halign: "center",
                fontSize: 10,
                lineWidth: 0.3,
                lineColor: [0, 0, 0]
            },
            alternateRowStyles: false, // We'll handle this manually
            didParseCell: data => {
                if (data.section === "head") {
                    data.cell.styles.fillColor = [200, 200, 220]; // Header background
                    data.cell.styles.fontStyle = "bold";
                    data.cell.styles.textColor = [0, 0, 0];
                } else if (data.section === "body") {
                    if (data.row.index % 2 === 0) {
                        // Even rows
                        data.cell.styles.fillColor = [250, 250, 210]; // Light background
                    } else {
                        // Odd rows
                        data.cell.styles.fillColor = [255, 255, 255]; // White background
                    }
                }
            }
        });

        // Save the PDF
        pdf.save("product-list.pdf");
    } catch (error) {
        console.error("Error exporting to PDF:", error);
    }
}
async function fetchProductsforExporting() {
    try {
        const categoryFilter = document.getElementById("category-select").value;
        const stockFilter = document.getElementById("stock-select").value;
        const sortFilter = document.getElementById("sort-select").value;

        let query = db.collection("products");

        // Filter by category
        if (categoryFilter) {
            query = query.where("category", "==", categoryFilter);
        }

        // Filter by stock level
        if (stockFilter) {
            if (stockFilter === "low-stock") {
                query = query.where("stock", "<=", 10);
            } else if (stockFilter === "medium-stock") {
                query = query.where("stock", ">=", 11).where("stock", "<=", 50);
            } else if (stockFilter === "high-stock") {
                query = query.where("stock", ">=", 51);
            }
        }

        // Sort by cost price
        if (sortFilter) {
            query = query.orderBy("costPrice", sortFilter);
        }

        // Ensure that Firestore orders by category as well to allow the filters to work
        query = query.orderBy("category");

        // Finally, ensure correct ordering by document ID (__name__) if needed
        query = query.orderBy("__name__");

        const snapshot = await query.get();
        const products = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                label: data.label,
                barcode: data.barcode,
                costPrice: data.costPrice,
                profit: data.profit,
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

async function fetchDebtDetailsForExport(customerId) {
    const snapshot = await db.collection("customers").doc(customerId).collection("debts").get();
    let total = 0;

    const debts = snapshot.docs.map(doc => {
        const data = doc.data();
        total += data.balance;
        return {
            details: data.details,
            balance: data.balance.toFixed(2),
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : "Unknown Date",
        };
    });

    return { debts, total: total.toFixed(2) };
}
function exportDebtDetailsToPDF(debtDetails, customerName, customerPhone, totalBalance) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFillColor(200, 200, 220);
    pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');

    pdf.setFontSize(16);
    pdf.text("Customer Debt Details", 10, 10);

    const columns = ["Details", "Balance ($)", "Created At"];
    const rows = debtDetails.map(debt => [
        debt.details,
        debt.balance,
        debt.createdAt
    ]);

    // Add final total row with merged cells
    rows.push([
        { content: `Total Balance: $${totalBalance}`, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [250, 250, 210] } }
    ]);

    const customerInfo = [
        [
            { content: "Customer Name:", styles: { fillColor: [255, 255, 255], fontStyle: "bold", halign: "left", cellWidth: 35 } },
            { content: customerName, styles: { fillColor: [250, 250, 210], halign: "left", cellWidth: 84 } }
        ],
        [
            { content: "Phone Number:", styles: { fillColor: [255, 255, 255], fontStyle: "bold", halign: "left", cellWidth: 35 } },
            { content: customerPhone, styles: { fillColor: [250, 250, 210], halign: "left", cellWidth: 84 } }
        ]
    ];

    pdf.autoTable({
        head: [columns],
        body: rows,
        startY: 50,
        margin: { top: 10 },
        theme: "grid",
        styles: {
            valign: "middle",
            halign: "center",
            fontSize: 10,
            lineWidth: 0.3,
            lineColor: [0, 0, 0],
        },
        alternateRowStyles: false,
        didParseCell: data => {
            if (data.section === "head") {
                data.cell.styles.fillColor = [255, 255, 255];
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.textColor = [0, 0, 0];
            } else if (data.section === "body") {
                if (data.row.index % 2 === 0) {
                    data.cell.styles.fillColor = [250, 250, 210];
                } else {
                    data.cell.styles.fillColor = [255, 240, 100];
                }
            }
        },
        didDrawPage: function () {
            pdf.autoTable({
                body: customerInfo,
                startY: 20,
                theme: "plain",
                styles: {
                    fontSize: 11,
                    textColor: [0, 0, 0],
                    lineWidth: 0.3,
                    lineColor: [0, 0, 0],
                }
            });
        }
    });

    pdf.save(`${customerName}_debt_details.pdf`);
}


async function exportCartToPDF() {
    if (!currentCartId) {
        console.error("No active cart to export.");
        return;
    }

    const cartDocRef = db.collection("carts").doc(currentCartId);
    const cartSnapshot = await cartDocRef.get();
    if (!cartSnapshot.exists) {
        console.error("Cart does not exist.");
        return;
    }

    const cartData = cartSnapshot.data();

    // Fetch cart products from the subcollection
    const cartProductsSnapshot = await cartDocRef.collection("cartProducts").get();
    if (cartProductsSnapshot.empty) {
        alert("Cart is empty. Please add products before exporting.");
        return;
    }

    const cartProducts = cartProductsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.name,
            quantity: data.quantity,
            costPrice: data.costPrice,
            total: data.total
        };
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFillColor(180, 180, 250); // RGB color
    pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');

    // Title
    pdf.setFontSize(16);
    pdf.text("Cart Details", 10, 10);

    // --- Styled Cart Details Table ---
    const cartDetails = [
        [
            {
                content: "Cart Name:",
                styles: {
                    fillColor: [200, 200, 220], // Even row color
                    fontStyle: "bold",
                    halign: "left",
                    textColor: [0, 0, 0],
                    cellWidth: 30
                }
            },
            {
                content: cartData.name,
                styles: {
                    fillColor: [250, 250, 210],
                    fontStyle: "normal",
                    halign: "left",
                    textColor: [0, 0, 0],
                    cellWidth: 63
                }
            }
        ],
        [
            {
                content: "Date Created:",
                styles: {
                    fillColor: [200, 200, 220],
                    fontStyle: "bold",
                    halign: "left",
                    textColor: [0, 0, 0],
                    cellWidth: 30
                }
            },
            {
                content: cartData.dateCreated.toDate().toLocaleString(),
                styles: {
                    fillColor: [250, 250, 210],
                    fontStyle: "normal",
                    halign: "left",
                    textColor: [0, 0, 0],
                    cellWidth: 63
                }
            }
        ],
        [
            {
                content: "Total Cost:",
                styles: {
                    fillColor: [200, 200, 220],
                    fontStyle: "bold",
                    halign: "left",
                    textColor: [0, 0, 0],
                    cellWidth: 30
                }
            },
            {
                content: `$${cartData.totalCost.toFixed(2)}`,
                styles: {
                    fillColor: [250, 250, 210],
                    fontStyle: "normal",
                    halign: "left",
                    textColor: [0, 0, 0],
                    cellWidth: 63
                }
            }
        ]
    ];

    pdf.autoTable({
        body: cartDetails,
        startY: 20,
        theme: "grid",
        styles: {
            fontSize: 11,
            valign: "middle",
            lineWidth: 0.3,
            lineColor: [0, 0, 0]
        }
    });

    // --- Styled Cart Products Table ---
    const finalY = pdf.lastAutoTable.finalY + 10;
    const columns = ["Product Name", "Quantity", "Cost Price ($)", "Total ($)"];
    const rows = cartProducts.map(product => [
        product.name,
        product.quantity,
        product.costPrice.toFixed(2),
        product.total.toFixed(2)
    ]);

    pdf.autoTable({
        head: [columns],
        body: rows,
        startY: finalY,
        theme: "grid",
        styles: {
            valign: "middle",
            halign: "center",
            fontSize: 10,
            lineWidth: 0.3,
            lineColor: [0, 0, 0]
        },
        alternateRowStyles: false,
        didParseCell: data => {
            if (data.section === "head") {
                data.cell.styles.fillColor = [200, 200, 220];
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.textColor = [0, 0, 0];
            } else if (data.section === "body") {
                data.cell.styles.fillColor = data.row.index % 2 === 0
                    ? [250, 250, 210]
                    : [255, 255, 255];
                data.cell.styles.textColor = [0, 0, 0];
            }
        }
    });

    // Save PDF
    pdf.save(`${cartData.name}_export.pdf`);
}

async function exportSalesTableToPDF(event) {
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFillColor(250, 250, 210); // RGB color
        pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');

        // Locate the button that triggered the export
        const button = event.target;

        // Find the associated table and its header
        const table = button.closest(".table-actions").previousElementSibling; // <table>
        const salesHeader = table.previousElementSibling; // <h3>Sales on DATE

        if (!table || !salesHeader) {
            console.error("Table or header not found.");
            return;
        }

        const salesDate = salesHeader.textContent.replace("Sales on ", "").trim();

        // Set PDF title
        pdf.setFontSize(16);
        pdf.text(`Sales Report - ${salesDate}`, 10, 10);

        // Extract headers from <thead>
        const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText);

        // Extract rows from <tbody>
        const bodyRows = Array.from(table.querySelectorAll("tbody tr")).map(row =>
            Array.from(row.querySelectorAll("td")).map(td => td.innerText)
        );

        // Extract the footer row from <tfoot>
        const footerRow = table.querySelector("tfoot tr");
        const footerCells = Array.from(footerRow.querySelectorAll("td")).map((td, index) => {
            if (index === 0) {
                return {
                    content: td.innerText,
                    colSpan: 3,
                    styles: { halign: "center", fontStyle: "bold" }
                };
            } else {
                return { content: td.innerText, styles: { fontStyle: "bold" } };
            }
        });

        // Combine body rows and footer row
        const rowsWithFooter = [...bodyRows, footerCells];

        // Generate the table in the PDF with row styling
        pdf.autoTable({
            head: [headers],
            body: rowsWithFooter,
            startY: 20,
            theme: "grid",
            styles: {
                valign: "middle", // Vertically center content in all cells
                halign: "center", // Horizontally center content in all cells
                fontSize: 10,
                lineWidth: 0.3, // Set border thickness to 3 pixels for all cells
                lineColor: [0, 0, 0] // Border color (black in RGB)
            },
            alternateRowStyles: false, // Disable default row styling
            didParseCell: data => {
                if (data.section === "head") {
                    // Apply specific styles for header cells
                    data.cell.styles.fillColor = [200, 200, 220]; // Background color for headers
                    data.cell.styles.fontStyle = "bold"; // Bold font for headers
                    data.cell.styles.textColor = [0, 0, 0]; // Black text for headers
                } else if (data.section === "body") {
                    if (data.row.index === bodyRows.length) {
                        // Styling for totals row (footer)
                        data.cell.styles.fillColor = [211, 211, 211]; // Light goldenrod yellow
                        data.cell.styles.fontStyle = "bold"; // Bold font
                    } else if (data.row.index % 2 === 0) {
                        // Even row styling
                        data.cell.styles.fillColor = [250, 250, 210]; // Light gray
                    } else {
                        // Odd row styling
                        data.cell.styles.fillColor = [255, 255, 255]; // White background
                    }
                }
            }
        });

        // Save the PDF
        pdf.save(`sales-report-${salesDate}.pdf`);
    } catch (error) {
        console.error("Error exporting sales table:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeEventListeners();
    showLoadingOverlay(1500);
});