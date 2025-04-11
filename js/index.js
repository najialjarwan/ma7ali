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
            initCartsAndSalesSection();
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
            <input type="text" id="costPrice" name="costPrice" ><br>

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
        <div id="cart-icon">
            <span id="cart-quantity" class="cart-badge">0</span>
            <img src="icons/cart-shopping-solid.svg" alt="Cart" width="100" height="100">
        </div>
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
        showLoadingOverlay(1000);
        showCartForm();
        const cartDocRef = db.collection("carts").doc(currentCartId);
        const cartProductsSnapshot = await cartDocRef.collection("cartProducts").get();

        const cancelMap = {};

        for (let doc of cartProductsSnapshot.docs) {
            const data = doc.data();
            const productId = data.productId || doc.id;
            const quantity = data.quantity || 1;

            cancelMap[productId] = (cancelMap[productId] || 0) + quantity;
        }

        // Reverse sale per product using optimized single call
        for (let productId in cancelMap) {
            await cancelProductQuantity(productId, cancelMap[productId]);
        }

        // Clear the cart
        const batch = db.batch();
        cartProductsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        batch.delete(cartDocRef);

        await batch.commit();

        currentCartId = null;

        console.log("Cart canceled and all products restored from sales.");
    } catch (error) {
        console.error("Error canceling cart:", error);
    }
}
let localCart = {};
let updateTimer = null;
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

        currentCartId = cartRef.id;
        localCart = {};
        updateLocalCartUI();
        displayCart(cartRef.id);
    } catch (error) {
        console.error("Error adding cart:", error);
    }
}
async function displayCart(cartId) {
    const cartDisplayContainer = document.getElementById("cart-display-container");
    setTimeout(() => {
        cartDisplayContainer.style.display = "block";
    }, 1200);
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
        }
    });
}
function addToCart(productId, label, costPrice) {
    if (!currentCartId) {
        console.error("No active cart found");
        return;
    }

    if (localCart[productId]) {
        localCart[productId].quantity += 1;
        localCart[productId].total = localCart[productId].quantity * costPrice;
    } else {
        localCart[productId] = {
            name: label,
            quantity: 1,
            costPrice: costPrice,
            total: costPrice
        };
    }

    updateLocalCartUI();

    if (updateTimer) clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
        syncCartToFirestore();
    }, 300);
}
function updateLocalCartUI() {
    let totalQuantity = 0;
    for (let id in localCart) {
        totalQuantity += localCart[id].quantity;
    }

    const cartQuantityEl = document.getElementById("cart-quantity");
    if (cartQuantityEl) {
        cartQuantityEl.textContent = totalQuantity;
    }
}
async function syncCartToFirestore() {
    const cartDoc = db.collection("carts").doc(currentCartId);
    let totalCost = 0;

    for (const productId in localCart) {
        const product = localCart[productId];
        totalCost += product.total;

        const cartProductRef = cartDoc.collection("cartProducts").doc(productId);
        await cartProductRef.set({
            name: product.name,
            quantity: product.quantity,
            costPrice: product.costPrice,
            total: product.total
        }, { merge: true });
    }

    await cartDoc.set({ totalCost }, { merge: true });
}
async function fetchProductToAdd() {
    const searchInput = document.getElementById("search-customers");
    const productCardContainer = document.getElementById("cart-products-container");

    try {
        const querySnapshot = await db.collection("products").orderBy("label").get();
        let allProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (showSales)
            displayProducts(allProducts);

        searchInput.addEventListener("input", function () {
            const searchValue = searchInput.value.toLowerCase();
            const filteredProducts = allProducts.filter(product =>
                product.label.toLowerCase() === (searchValue)
            );
            displayProducts(filteredProducts);
        });

        function displayProducts(products) {
            productCardContainer.innerHTML = "";
            if (products.length === 0) {
                productCardContainer.innerHTML = `
                <div class="no-products-message">
                    No products found. Check Product name!
                </div>
                `;
                return;
            }

            products.forEach(product => {
                displayProductToAdd(product, product.id);
            });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}
async function displayProductToAdd(product, productId) {

    await loadTodaySaleToLocal();

    const productCardContainer = document.getElementById("cart-products-container");

    const actionText = showSales ? "Add to Sales" : "Add to Cart";
    const actionFunction = showSales ? addToSales : addToCart;

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
    `;

    const actionBtn = productCard.querySelector(".add-to-cart-btn");
    const cancelBtn = productCard.querySelector(".cancel-sale-btn");
    let lastAnimationTime = 0;
    const animationCooldown = 100;
    const productSnap = await db.collection("products").doc(productId).get();
    let currentStock = productSnap.data().stock;
    actionBtn.addEventListener("click", async function () {

        if (currentStock <= 0) {
            showModalMessage(`
                <p>Product stock is 0!</p>
                <p style="color: yellow; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);">
                    Update the stock to add to sales.
                </p>
            `, false);
            return;
        }

        await actionFunction(productId, product.label, product.costPrice, product.profit);
        currentStock -= 1;
        if (!showSales) {
            addToSales(productId, product.label, product.costPrice, product.profit);

            const now = Date.now();
            if (now - lastAnimationTime > animationCooldown) {
                lastAnimationTime = now;

                const productImage = productCard.querySelector("img");
                const cartIcon = document.getElementById("cart-icon");

                if (productImage && cartIcon) {
                    const clonedImage = productImage.cloneNode(true);
                    const imageRect = productImage.getBoundingClientRect();
                    const cartRect = cartIcon.getBoundingClientRect();

                    clonedImage.classList.add("fly-img");
                    clonedImage.style.left = `${imageRect.left}px`;
                    clonedImage.style.top = `${imageRect.top}px`;
                    clonedImage.style.width = `${imageRect.width}px`;
                    clonedImage.style.height = `${imageRect.height}px`;

                    document.body.appendChild(clonedImage);

                    requestAnimationFrame(() => {
                        clonedImage.style.left = `${cartRect.left + cartRect.width / 2 - imageRect.width / 2}px`;
                        clonedImage.style.top = `${cartRect.top + cartRect.height / 2 - imageRect.height / 2 - 15}px`;
                        clonedImage.style.transform = "scale(0.1)";
                        clonedImage.style.opacity = "1";
                    });

                    setTimeout(() => {
                        clonedImage.remove();
                    }, 700);

                    cartIcon.classList.remove("pulse");
                    void cartIcon.offsetWidth;
                    cartIcon.classList.add("pulse");
                }
            }
        } else {
            showLoadingOverlay(1000);
        }
    });

    if (showSales) {
        cancelBtn.addEventListener("click", async function () {
            showLoadingOverlay(1000);
            await cancelSale(productId);
            currentStock += 1;
        });
    }

    productCardContainer.appendChild(productCard);
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
let localSale = {};
let updateSaleTimer = null;
let currentSaleId = null;
async function addToSales(productId, label, costPrice, profit) {
    const today = new Date().toLocaleDateString('en-CA');
    if (currentSaleId !== today) {
        console.log("New day detected. Resetting local sale data.");
        currentSaleId = today;
        localSale = {};
    }

    const productRef = db.collection("products").doc(productId);

    if (localSale[productId]) {
        localSale[productId].quantity += 1;
        localSale[productId].total = localSale[productId].quantity * costPrice;
        localSale[productId].totalProfit = localSale[productId].quantity * profit;
    } else {
        localSale[productId] = {
            name: label,
            quantity: 1,
            costPrice: costPrice,
            profit: profit,
            total: costPrice,
            totalProfit: profit,
        };
    }

    await productRef.update({
        stock: firebase.firestore.FieldValue.increment(-1)
    });

    if (updateSaleTimer) clearTimeout(updateSaleTimer);
    updateSaleTimer = setTimeout(() => {
        syncSalesToFirestore();
    }, 300);
    refreshProductList();
}
async function syncSalesToFirestore() {
    console.log("Syncing sale to Firestore:", currentSaleId);

    const saleDoc = db.collection("sales").doc(currentSaleId);

    // Sync each product to the productsSold subcollection
    for (const productId in localSale) {
        const product = localSale[productId];
        await saleDoc.collection("productsSold").doc(productId).set({
            name: product.name,
            quantity: product.quantity,
            costPrice: product.costPrice,
            profit: product.profit,
            total: product.total,
            totalProfit: product.totalProfit,
            dateSold: firebase.firestore.Timestamp.now()
        }, { merge: true });
    }

    // Now calculate totals from productsSold collection
    const productsSnapshot = await saleDoc.collection("productsSold").get();
    let totalProductsSold = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    productsSnapshot.forEach(doc => {
        const data = doc.data();
        totalProductsSold += data.quantity || 0;
        totalRevenue += data.total || 0;
        totalProfit += data.totalProfit || 0;
    });

    await saleDoc.set({
        totalProductsSold,
        totalRevenue,
        totalProfit
    }, { merge: true });
}
async function cancelSale(productId) {
    const today = new Date().toLocaleDateString('en-CA');

    const productInSale = localSale[productId];
    if (!productInSale || productInSale.quantity <= 0) {
        showModalMessage(`
            <p>Product sold quantity is 0!</p>
            <p style="color: yellow; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);"></p>
        `, false);
        return;
    }

    const saleDocRef = db.collection("sales").doc(currentSaleId);
    const productRef = db.collection("products").doc(productId);
    const productSoldRef = saleDocRef.collection("productsSold").doc(productId);

    // Step 1: Decrease the quantity in localSale
    productInSale.quantity -= 1;
    productInSale.total = productInSale.quantity * productInSale.costPrice;
    productInSale.totalProfit = productInSale.quantity * productInSale.profit;

    // If quantity reaches zero, remove the product from localSale and delete from productsSold
    if (productInSale.quantity === 0) {
        delete localSale[productId];
        await productSoldRef.delete(); // Remove product from Firestore
    } else {
        // Update Firestore productSold collection
        await productSoldRef.set({
            name: productInSale.name,
            quantity: productInSale.quantity,
            costPrice: productInSale.costPrice,
            profit: productInSale.profit,
            total: productInSale.total,
            totalProfit: productInSale.totalProfit
        }, { merge: true });
    }

    // Step 2: Restore stock in the products collection
    await productRef.update({
        stock: firebase.firestore.FieldValue.increment(1) // Restores stock by 1
    });

    // Step 3: Recalculate the totals of all sales
    let totalProductsSold = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    for (const id in localSale) {
        const item = localSale[id];
        totalProductsSold += item.quantity;
        totalRevenue += item.total;
        totalProfit += item.totalProfit;
    }

    await saleDocRef.set({
        totalProductsSold,
        totalRevenue: totalRevenue,
        totalProfit
    }, { merge: true });

    console.log(`Canceled one unit of ${productInSale.name}. Stock restored.`);
}
async function cancelProductQuantity(productId, quantityToCancel) {
    const today = new Date().toLocaleDateString('en-CA');
    const saleDocRef = db.collection("sales").doc(today);
    const productSoldRef = saleDocRef.collection("productsSold").doc(productId);
    const productRef = db.collection("products").doc(productId);

    const productDoc = await productSoldRef.get();
    if (!productDoc.exists) return;

    const productData = productDoc.data();

    const cancelQty = Math.min(productData.quantity, quantityToCancel);
    if (cancelQty <= 0) return;

    const updatedQty = productData.quantity - cancelQty;

    // Update or delete productSold
    if (updatedQty === 0) {
        await productSoldRef.delete();
    } else {
        await productSoldRef.update({
            quantity: updatedQty,
            total: updatedQty * productData.costPrice,
            totalProfit: updatedQty * productData.profit
        });
    }

    // Restore stock
    await productRef.update({
        stock: firebase.firestore.FieldValue.increment(cancelQty)
    });

    // Reload sales from Firestore to recalculate totals
    await loadTodaySaleToLocal();

    console.log(`Canceled ${cancelQty} unit(s) of ${productData.name}. Stock restored.`);
}
async function loadTodaySaleToLocal() {
    const today = new Date().toLocaleDateString('en-CA');
    currentSaleId = today;
    localSale = {};

    const saleDocRef = db.collection("sales").doc(today);
    const productsSnapshot = await saleDocRef.collection("productsSold").get();

    productsSnapshot.forEach(doc => {
        const data = doc.data();
        localSale[doc.id] = {
            name: data.name,
            quantity: data.quantity,
            costPrice: data.costPrice,
            profit: data.profit,
            total: data.total,
            totalProfit: data.totalProfit,
            dateSold: data.dateSold
        };
    });

    console.log("Loaded today's sale into local memory:");
}
function showLoadingOverlay(duration = 400) {
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
                <label for="category-select">Filter Category:</label>
                <select id="category-select">
                    <option value="">All Categories</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="price-select">Filter Price:</label>
                <select id="price-select">
                    <option value="">All Prices</option>
                    <option value="low-price">Low Price (0-10)</option>
                    <option value="medium-price">Medium Price (11-50)</option>
                    <option value="high-price">High Price (51+)</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="stock-select">Filter Stock:</label>
                <select id="stock-select">
                        <option value="">All Stocks</option>
                        <option value="low-stock" style="color: red;">Low Stock (0-10)</option>
                        <option value="medium-stock" style="color: yellow;">Medium Stock (11-50)</option>
                        <option value="high-stock" style="color: green;">High Stock (51+)</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="profit-select">Filter Profit:</label>
                <select id="profit-select">
                        <option value="">All Profits</option>
                        <option value="low-profit">Low profit (0-10)</option>
                        <option value="medium-profit">Medium Profit (11-20)</option>
                        <option value="high-profit">High Profit (21+)</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="sort-by-price-stock-profit">Sort:</label>
                <select id="sort-by-price-stock-profit">
                    <option value="">No Sort</option>
                    <optgroup label="Sort by Price">
                        <option value="price-asc">Lowest to Highest</option>
                        <option value="price-desc">Highest to Lowest</option>
                    </optgroup>
                    <optgroup label="Sort by Stock">
                        <option value="stock-asc">Lowest to Highest</option>
                        <option value="stock-desc">Highest to Lowest</option>
                    </optgroup>
                    <optgroup label="Sort by Profit">
                        <option value="profit-asc">Lowest to Highest</option>
                        <option value="profit-desc">Highest to Lowest</option>
                    </optgroup>
                </select>
            </div>

            <button id="reset-filters" type="button" class="func-btn">Reset Filters</button>
            <button class="func-btn" style="color: var(--btnText-color);" id="export-product-btn">EXPORT PRODUCTS</button>
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
    const priceSelect = document.getElementById("price-select");
    const stockSelect = document.getElementById("stock-select");
    const profitSelect = document.getElementById("profit-select");
    const sortByPriceStockProfit = document.getElementById("sort-by-price-stock-profit");

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


            const selectedCategory = categorySelect.value;
            if (selectedCategory) {
                filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
            }

            const priceRange = priceSelect.value;
            if (priceRange) {
                switch (priceRange) {
                    case "low-price":
                        filteredProducts = filteredProducts.filter(product => product.costPrice >= 0 && product.costPrice <= 10);
                        break;
                    case "medium-price":
                        filteredProducts = filteredProducts.filter(product => product.costPrice >= 11 && product.costPrice <= 50);
                        break;
                    case "high-price":
                        filteredProducts = filteredProducts.filter(product => product.costPrice > 50);
                        break;
                }
            }

            const stockRange = stockSelect.value;
            if (stockRange) {
                switch (stockRange) {
                    case "low-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock >= 0 && product.stock <= 10);
                        break;
                    case "medium-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock >= 11 && product.stock <= 50);
                        break;
                    case "high-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock > 50);
                        break;
                }
            }

            const profitRange = profitSelect.value;
            if (profitRange) {
                switch (profitRange) {
                    case "low-profit":
                        filteredProducts = filteredProducts.filter(product => product.profit >= 0 && product.profit <= 10);
                        break;
                    case "medium-profit":
                        filteredProducts = filteredProducts.filter(product => product.profit >= 11 && product.profit <= 20);
                        break;
                    case "high-profit":
                        filteredProducts = filteredProducts.filter(product => product.profit > 21);
                        break;
                }
            }

            const sort = sortByPriceStockProfit.value;
            if (sort === "price-asc" || sort === "price-desc") {

                filteredProducts = filteredProducts.sort((a, b) =>
                    sort === "price-asc" ? a.costPrice - b.costPrice : b.costPrice - a.costPrice
                );
            } else if (sort === "stock-asc" || sort === "stock-desc") {
                filteredProducts = filteredProducts.sort((a, b) =>
                    sort === "stock-asc" ? a.stock - b.stock : b.stock - a.stock
                );
            } else {
                filteredProducts = filteredProducts.sort((a, b) =>
                    sort === "profit-asc" ? a.profit - b.profit : b.profit - a.profit
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

        document.getElementById("reset-filters").addEventListener("click", () => {
            document.getElementById("category-select").value = "";
            document.getElementById("price-select").value = "";
            document.getElementById("stock-select").value = "";
            document.getElementById("profit-select").value = "";
            document.getElementById("sort-by-price-stock-profit").value = "";
            applyFilters();
        });

        categorySelect.addEventListener("change", applyFilters);
        priceSelect.addEventListener("change", applyFilters);
        stockSelect.addEventListener("change", applyFilters);
        profitSelect.addEventListener("change", applyFilters);
        sortByPriceStockProfit.addEventListener("change", applyFilters);

        renderProducts(products);
    } catch (error) {
        productsGrid.innerHTML = `<p>Error fetching products: ${error.message}</p>`;
        console.error("Error fetching products:", error);
    }
}
let allProducts = [];
function fetchProductsForDoc() {
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
                createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "Unknown Date",
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
                <p><strong>Cost Price:</strong> $${product.costPrice}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Stock:</strong> ${product.stock}</p>
                <p><strong>Created At:</strong> ${product.createdAt}</p>
            </div>
        </div>
    `).join("");

    let productsGrid = `<div id="products-grid" class="products-grid">${productCards}</div>`;
    $(".main-content").html(productCards ? productsGrid : "<p>No products found.</p>");

    $(".product-card").on("click", function () {
        const productId = $(this).data("id");
        const product = allProducts.find(p => p.id === productId);
        displayProductForm(product);
    });
}
function refreshProductList() {
    fetchProductsForDoc().then((products) => {
        allProducts = products;
        console.log("Products refreshed.");
    });
}
$(document).ready(function () {
    fetchProductsForDoc().then(products => {
        allProducts = products;
        displayProducts(products);
    });

    $(".search-bar").on("input", function () {
        let searchText = $(this).val().toLowerCase().trim();
        let filtered = allProducts.filter(product =>
            product.label.toLowerCase().startsWith(searchText)
        );
        displayProducts(filtered);
    });
});
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
            refreshProductList();
        })
        .catch(error => {
            console.error("Error removing product:", error);
        });
}//<--------------->//


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


        try {

            const customersSnapshot = await db.collection("customers").get();


            const filteredCustomers = [];
            customersSnapshot.forEach((doc) => {
                const customer = { id: doc.id, ...doc.data() };
                const name = customer.name.toLowerCase();
                const phoneNumber = customer.phoneNumber;

                if (name.includes(searchValue) || phoneNumber.includes(searchValue)) {
                    filteredCustomers.push(customer);
                }
            });

            customersGrid.innerHTML = "";

            if (filteredCustomers.length > 0) {
                filteredCustomers.forEach((customer) => {

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
                customersGrid.innerHTML = `                
                    <div class="no-products-message">
                        No Customers Found. Check Customer Name!
                    </div>`;
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


//<CartsAndSales Section>//
function initCartsAndSalesSection() {
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
                    <input type="text" class="search-bar" id="search-cart" placeholder="Search Cart"/>
                    <img src="icons/magnifying-glass-solid.svg" width="24" height="24" alt="Search" class="search-icon"/>
                </div>

                <div class="carts-table" id="carts-table"></div>
            </div>`;

        const cartsData = await fetchCartsData();
        renderCartsTable(cartsData);

        const searchInput = document.getElementById("search-cart");
        searchInput.addEventListener("input", function () {
            const searchValue = searchInput.value.trim().toLowerCase();
            const filteredCarts = searchValue === ""
                ? cartsData
                : cartsData.filter(cart => cart.name.toLowerCase().startsWith(searchValue));
            renderCartsTable(filteredCarts);
        });
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
                dateCreated: data.dateCreated.toDate(),
            });
        });

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
        cartsTable.innerHTML = `                
            <div class="no-products-message">
                No Carts Found. Check Cart Name!
            </div>`;
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
                    const productItems = Array.from(productsSnapshot.docs).map(doc => {
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

                    productsContainer.innerHTML = `${productItems}`;
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
        const salesDate = doc.id;
        const salesInfo = doc.data();
        const productsSnapshot = await salesCollection.doc(salesDate).collection("productsSold").get();

        const productsSold = productsSnapshot.docs.map(productDoc => ({
            id: productDoc.id,
            ...productDoc.data()
        }));

        // Sort products within this sale by quantity descending
        productsSold.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

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
    if (optGroup)
        optGroup.innerHTML = "";

    salesData.forEach(sale => {
        const option = document.createElement("option");
        option.value = sale.salesDate;
        option.textContent = sale.salesDate;
        optGroup.appendChild(option);
    });
}
function filterSales(salesData, filterType) {
    const todayDate = new Date(); // Keep the Date object
    const todayStr = todayDate.toLocaleDateString('en-CA'); // YYYY-MM-DD (local timezone)

    const yesterdayDate = new Date(todayDate); // Clone the date
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toLocaleDateString('en-CA'); // Same format, local timezone

    if (filterType === "today") {
        return salesData.filter(sale => sale.salesDate === todayStr);
    }
    if (filterType === "yesterday") {
        return salesData.filter(sale => sale.salesDate === yesterdayStr);
    }
    if (filterType === "thisWeek") {
        const startOfWeek = new Date(todayDate);
        startOfWeek.setDate(todayDate.getDate() - todayDate.getDay()); // Get Monday
        const startOfWeekStr = startOfWeek.toLocaleDateString('en-CA');
        return salesData.filter(sale => new Date(sale.salesDate) >= new Date(startOfWeekStr));
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
                <th>Last Date Sold</th>
                <th>Cost Price</th>
                <th>Quantity</th>
                <th>Total Revenue</th>
                <th>Total Profit</th>
            </tr>
        `;

        const tbody = document.createElement("tbody");

        if (sale.productsSold.length > 0) {
            sale.productsSold.forEach(product => {
                const date = product.dateSold?.toDate
                    ? product.dateSold.toDate().toLocaleString('en-US')
                    : "N/A";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.name || "N/A"}</td>
                    <td>${date}</td>
                    <td>$${(product.costPrice ?? 0).toFixed(2)}</td>
                    <td>${product.quantity ?? 0}</td>
                    <td>$${(product.total ?? 0).toFixed(2)}</td>
                    <td>$${(product.totalProfit ?? 0).toFixed(2)}</td>
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
        const priceSelect = document.getElementById("price-select").value;
        const stockSelect = document.getElementById("stock-select").value;
        const profitSelect = document.getElementById("profit-select").value;
        const sort = document.getElementById("sort-by-price-stock-profit").value;

        let query = db.collection("products");

        if (categoryFilter) {
            query = query.where("category", "==", categoryFilter);
        }

        if (priceSelect) {
            if (priceSelect === "low-price") {
                query = query.where("costPrice", "<=", 10);
            } else if (priceSelect === "medium-price") {
                query = query.where("costPrice", ">=", 11).where("costPrice", "<=", 50);
            } else if (priceSelect === "high-price") {
                query = query.where("costPrice", ">=", 51);
            }
        }

        if (stockSelect) {
            if (stockSelect === "low-stock") {
                query = query.where("stock", "<=", 10);
            } else if (stockSelect === "medium-stock") {
                query = query.where("stock", ">=", 11).where("stock", "<=", 50);
            } else if (stockSelect === "high-stock") {
                query = query.where("stock", ">=", 51);
            }
        }

        if (profitSelect) {
            if (profitSelect === "low-profit") {
                query = query.where("profit", "<=", 10);
            } else if (profitSelect === "medium-profit") {
                query = query.where("profit", ">=", 11).where("profit", "<=", 20);
            } else if (profitSelect === "high-profit") {
                query = query.where("profit", ">=", 21);
            }
        }

        if (sort === "price-asc") {
            query = query.orderBy("costPrice", "asc");
        } else if (sort === "price-desc") {
            query = query.orderBy("costPrice", "desc");
        } else if (sort === "stock-asc") {
            query = query.orderBy("stock", "asc");
        } else if (sort === "stock-desc") {
            query = query.orderBy("stock", "desc");
        } else if (sort === "profit-asc") {
            query = query.orderBy("profit", "asc");
        } else if (sort === "profit-desc") {
            query = query.orderBy("profit", "desc");
        }

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

        console.log(products);
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