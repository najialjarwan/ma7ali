// #region ✅ Firebase Config
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

    } else {

    }
}

window.addEventListener("load", updateOnlineStatus);
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
// #endregion

// #region ▶️ EventListeners and LoadContent {
function initializeEventListeners() {

    // #region Pop Button And Adders
    const popButton = document.getElementById("pop");
    const slider = document.getElementById("slider");
    popButton.addEventListener("click", function (e) {

        slider.classList.toggle("active");
        popButton.classList.toggle("active");
        e.stopPropagation();
    });
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
    // #endregion

    // #region SideBar
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

    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('close-btn');
    const pdfLayoutLink = document.getElementById('pdf-layout');
    const helpLink = document.getElementById('help');
    const profileLink = document.getElementById('profile');

    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadContent("profile");
    });
    pdfLayoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadContent("pdflayout");
    });
    helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadContent("help");
    });

    menuBtn.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    }
    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    document.querySelector("#toggle-theme-btn").addEventListener("click", (e) => {
        // e.preventDefault(); // optionally remove this so checkbox toggle works visually
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
    // #endregion

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
        if (section === "dashboard")
            initDashboard();
        //
        //<Pop sections>//
        if (section === "addProduct")
            showProductForm();
        if (section === "addCustomer")
            showCustomerForm();
        if (section === "addCart")
            showCartForm();
        if (section === "addSales")
            showSalesForm();
        //

        if (section === "profile")
            initProfile();
        if (section === "pdflayout")
            initpdfLayout();
        if (section === "help")
            initHelp();
    } catch (error) {
        mainContent.innerHTML = `<h2>Error loading ${section}. Please try again later.</h2>`;
        console.error(error);
    }
}
// #endregion }


// #region 1️⃣ Add Product Section {
function showProductForm() {
    setCurrencyUpdateCallback(() => {
        showProductForm();
    });
    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = `
        <h2>Add a New Product</h2>
        <form id="product-form" class="product-form">
            <label for="barcode">Barcode: </label>
            <input type="text" id="barcode" name="barcode" >

            <label for="label">Product Label: </label>
            <input type="text" id="label" name="label" >

            <label for="img">Product Image: <span id="fileName">No file selected!</span> </label>
            <input type="file" id="img" name="img" accept="image/*" capture="environment" class="file-input">
            <button type="button" id="customFileButton">Choose File</button>

            <label for="costPrice">Cost Price (${storeCurrency}): </label>
            <input type="text" id="costPrice" name="costPrice">

            <label for="profit">Profit (${storeCurrency}): </label>
            <input type="text" id="profit" name="profit" >

            <label for="category">Category: </label>
            <input type="text" id="category" name="category">

            <label for="stock">Stock Quantity: </label>
            <input type="text" id="stock" name="stock">

            <button type="submit" class="action-btn">Add</button>
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
function addProduct() {
    const form = document.getElementById("product-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        clearFieldErrors();
        const formData = new FormData(form);
        const { hasError, errors, values } = validateProductForm(formData);

        if (hasError) {
            for (let fieldId in errors) {
                setFieldError(fieldId, errors[fieldId]);
            }
            showModalMessage(`<p>Failed to add the product!</p><p>Check ALL input fields.</p>`);
            return;
        }

        const {
            rawBarcode,
            rawLabel,
            rawCostPrice,
            rawProfit,
            rawCategory,
            rawStock,
            imageFile
        } = values;

        const rawCostPriceToUSD = storeCurrency === "LBP" ? convertCurrency(rawCostPrice, "LBP", "$") : rawCostPrice;
        const rawProfitToUSD = storeCurrency === "LBP" ? convertCurrency(rawProfit, "LBP", "$") : rawProfit;
        const productData = {
            barcode: parseInt(rawBarcode),
            label: rawLabel.toLowerCase(),
            img: "",
            costPrice: parseFloat(rawCostPriceToUSD),
            profit: parseFloat(rawProfitToUSD),
            category: rawCategory,
            stock: parseInt(rawStock, 10),
        };

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
        if (imageFile && imageFile.name && imageFile.size > 0) {
            try {
                const resizedImage = await convertToJPEG(imageFile);
                const storageRef = storage.ref();
                const imageRef = storageRef.child(`product-images/${imageFile.name}`);
                await imageRef.put(resizedImage);
                productData.img = await imageRef.getDownloadURL();
                console.timeEnd("[IMAGE] Resize and upload");
            } catch (error) {
                console.error("[IMAGE] Upload failed:", error);
                showModalMessage("Image upload failed. Please try again.", false);
                return;
            }
        }

        try {
            showLoadingOverlay(1500);
            const snapshot = await db.collection("products")
                .where("barcode", "==", productData.barcode)
                .get();

            const labelSnapshot = await db.collection("products")
                .where("label", "==", productData.label)
                .get();

            if (!snapshot.empty || !labelSnapshot.empty) {
                setTimeout(() => {
                    showModalMessage("Item with the enterd label already exists. Update or change product label and barcode.", false);
                }, 1500);
                return;
            }

            // 8. Add product to Firestore
            try {
                showLoadingOverlay(1500);
                setTimeout(() => {
                    showModalMessage("Product added successfully!", true);
                    form.reset();
                    document.getElementById("fileName").textContent = `No file selected`;
                }, 1500);
                const docRef = await db.collection("products").add({
                    ...productData,
                    createdAt: firebase.firestore.Timestamp.now(),
                });

                const newDoc = await docRef.get();
                const newProductData = newDoc.data();

                allProducts.push({
                    ...newProductData,
                    id: docRef.id,
                    createdAt: newProductData.createdAt.toDate().toLocaleDateString(),
                });

            } catch (error) {
                console.error("[PRODUCT] Error adding product:", error);
                showModalMessage(`Failed to add product: ${error.message}`, false);
            }
        } catch (error) {
            showModalMessage(`Failed to add product: ${error.message}`, false);
            console.error("[PRODUCT] Error checking existing product:", error);
        }
    });
}
function setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    input.classList.add("input-error");
    let errorMsg = input.parentNode.querySelector(`.error-text[data-for="${fieldId}"]`);
    if (!errorMsg) {
        errorMsg = document.createElement("span");
        errorMsg.className = "error-text";
        errorMsg.dataset.for = fieldId;
        input.insertAdjacentElement("afterend", errorMsg);
    }
    errorMsg.textContent = message;
}
function clearFieldErrors() {
    document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
    document.querySelectorAll(".error-text").forEach((el) => el.remove());
}
function validateProductForm(formData) {
    let hasError = false;
    const errors = {};

    const rawBarcode = formData.get("barcode");
    const rawLabel = formData.get("label");
    const rawCostPrice = formData.get("costPrice");
    const rawProfit = formData.get("profit");
    const rawCategory = formData.get("category");
    const rawStock = formData.get("stock");
    const imageFile = formData.get("img");
    const isUpdate = formData.get("formType") === "update";

    if (!rawBarcode || isNaN(rawBarcode) || rawBarcode.length < 8 || rawBarcode.length > 10) {
        errors.barcode = !rawBarcode
            ? "BARCODE is required AND must be a 8-10 digit number!"
            : isNaN(rawBarcode)
                ? "Barcode must be a number!"
                : rawBarcode.length < 8
                    ? "BARCODE must be at least 8 digits!"
                    : "BARCODE must be less then 10 digits!";
        hasError = true;
    }

    if (!rawLabel || rawLabel.length > 15) {
        errors.label = !rawLabel ? "PRODUCT LABEL is REQUIRED!" : "PRODUCT LABEL is too long!";
        hasError = true;
    }

    if (!isUpdate) {
        if (!imageFile || !imageFile.name || imageFile.size === 0) {
            errors.img = "IMAGE is REQUIRED";
            hasError = true;
        }
    }

    if (!rawCostPrice || isNaN(rawCostPrice)) {
        errors.costPrice = !rawCostPrice ? "PRODUCT COST PRICE is REQUIRED!" : "PRODUCT COST PRICE must be a NUMBER!";
        hasError = true;
    }
    else if ((storeCurrency === "$" && rawCostPrice > 500) || (storeCurrency === "LBP" && rawCostPrice < 5000)) {
        errors.costPrice = (storeCurrency === "$" && rawCostPrice > 500) ? "COST PRICE amount is too large!" : "COST PRICE amount is too small!";
        hasError = true;
    }

    if (!rawProfit || isNaN(rawProfit)) {
        errors.profit = !rawProfit ? "PRODUCT PROFIT is REQUIRED!" : "PRODUCT PROFIT must be a NUMBER!";
        hasError = true;
    }
    else if ((storeCurrency === "$" && rawProfit > 100) || (storeCurrency === "LBP" && rawProfit < 1000)) {
        errors.profit = (storeCurrency === "$" && rawProfit > 100) ? "PROFIT amount is too large!" : "PROFIT amount is too small!";
        hasError = true;
    }

    if (!rawCategory) {
        errors.category = "PRODUCT CATEGORY is REQUIRED";
        hasError = true;
    }

    if (!rawStock || isNaN(rawStock)) {
        errors.stock = !rawStock ? "PRODUCT STOCK is REQUIRED!" : "PRODUCT STOCK must be a NUMBER!";
        hasError = true;
    }

    return {
        hasError,
        errors,
        values: {
            rawBarcode,
            rawLabel,
            rawCostPrice,
            rawProfit,
            rawCategory,
            rawStock,
            imageFile,
        }
    };
}

// #endregion }

// #region 2️⃣ Add Customer Section {
function showCustomerForm() {
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
            <h1>Add Customer</h1>
            <form id="customer-form" class="product-form">
                <label for="name">Name: </label>
                <input type="text" id="name" name="name" required>

                <label for="phoneNumber">Phone Number: </label>
                <input type="number" id="phoneNumber" name="phoneNumber" required>

                <button type="submit" class="action-btn">Add</button>
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
// #endregion }

// #region 3️⃣ Add Cart Secton {
function showCartForm() {
    showSales = false;
    localSale = {};
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
        <form id="cart-form" class="product-form">
            <label for="cartName">Cart Name: (required)</label>
            <input type="text" id="cartName" name="cartName" required>
            <button type="submit" class="action-btn" id="save-cart-btn">Create Cart</button>
            <button type="button" class="action-btn" id="cancel-cart-btn" style="display: none;">Cancel Cart</button>
        </form>
        <div class="search-container-main" >
            <input type="text" class="search-bar" id="search-customers" disabled placeholder="Search Product to add"/>
            <img src="icons/magnifying-glass-solid.svg" width="24" height="24" alt="Search" class="search-icon"/>
                    <div id="cart-icon">
            <span id="cart-quantity" class="cart-badge">0</span>
            <img src="icons/cart-shopping-solid.svg" alt="Cart" width="30" height="30">
        </div>
        </div>
        <div class="cart-products-container" id="cart-products-container"></div>
        <div class="cart-display-container" id="cart-display-container" style="display: none">
        </div>
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
    setCurrencyUpdateCallback(() => {
        displayCart(cartId);
    });
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
                <p><strong>Total Cost: </strong>$${displayCurrency(cart.totalCost)}</p>
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
                    <p><strong>costPrice: $</strong>${displayCurrency(product.costPrice)}</p>
                    <p><strong>Total: $</strong>${displayCurrency(product.total)}</p>
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
                    exportBtn.className = "export-btn";
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

        let debounceTimer;
        searchInput.addEventListener("input", function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchValue = searchInput.value.toLowerCase().trim();
                if (searchValue === "" && !showSales) {
                    return;
                }
                const filteredProducts = allProducts.filter(product =>
                    showSales ? product.label.toLowerCase().includes(searchValue) : product.label.toLowerCase() === (searchValue)
                );
                displayProducts(filteredProducts);
            }, 500);
        });

        async function displayProducts(products) {
            productCardContainer.innerHTML = "";
            if (products.length === 0) {
                productCardContainer.innerHTML = `
                    <div class="no-products-message">
                        No products found. Check Product name!
                    </div>
                `;
                return;
            }
            products.forEach(async product => {
                await displayProductToAdd(product, product.id);
            });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}
async function displayProductToAdd(product, productId) {

    const productCardContainer = document.getElementById("cart-products-container");
    productCardContainer.innerHTML = ``;


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
                        clonedImage.style.top = `${cartRect.top + cartRect.height / 2 - imageRect.height / 2 - 5}px`;
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
// #endregion }

// #region 4️⃣ Add Sales Section {
let showSales = false;
let localSale = {};
let updateSaleTimer = null;
let currentSaleId = null;
function showSalesForm() {
    showSales = true;
    localSale = {};
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
        <div class="search-customer-container search-container-main" >
            <input type="text" class="search-bar" id="search-customers" placeholder="Search Product To Add"/>
            <img src="icons/magnifying-glass-solid.svg" width="24" height="24" alt="Search" class="search-icon"/>
        </div>
        <div class="cart-products-container" id="cart-products-container"></div>
    `;
    loadTodaySaleToLocal();
    fetchProductToAdd();
}
async function addToSales(productId, label, costPrice, profit) {
    const today = new Date().toLocaleDateString('en-CA');
    if (currentSaleId !== today) {

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
        syncSalesToFirestore(productId);
    }, 300);
    refreshProductList();
}
async function syncSalesToFirestore(productId) {
    const product = localSale[productId];
    const saleDoc = db.collection("sales").doc(currentSaleId);

    await saleDoc.collection("productsSold").doc(productId).set({
        name: product.name,
        quantity: product.quantity,
        costPrice: product.costPrice,
        profit: product.profit,
        total: product.total,
        totalProfit: product.totalProfit,
        dateSold: firebase.firestore.Timestamp.now()
    }, { merge: true });

    // Recalculate totals
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
        stock: firebase.firestore.FieldValue.increment(1)
    });
    refreshProductList();

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

    if (updatedQty === 0) {
        await productSoldRef.delete();
    } else {
        await productSoldRef.update({
            quantity: updatedQty,
            total: updatedQty * productData.costPrice,
            totalProfit: updatedQty * productData.profit
        });
    }

    await productRef.update({
        stock: firebase.firestore.FieldValue.increment(cancelQty)
    });

    await loadTodaySaleToLocal();


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
// #endregion }


// #region 1️⃣ Products Section {
let storeCurrency = "LBP";
let allProducts = [];
let isDOC = false;
let isProducts = false;
function initProductPage() {

    renderFilters();

    initButtonSelect("price-select", "price-buttons");
    initButtonSelect("stock-select", "stock-buttons");
    initButtonSelect("profit-select", "profit-buttons");

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
function initButtonSelect(selectId, buttonContainerId) {
    const select = document.getElementById(selectId);
    const buttons = document.querySelectorAll(`#${buttonContainerId} .filter-btn`);

    buttons.forEach(btn => {
        if (btn.dataset.value === select.value) {
            btn.classList.add("selected");
        }

        btn.addEventListener("click", () => {
            // Update UI
            buttons.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");

            // Update select value
            select.value = btn.dataset.value;

            // Trigger any existing change listeners
            const event = new Event("change", { bubbles: true });
            select.dispatchEvent(event);
        });
    });
}
async function fetchProducts() {
    setCurrencyUpdateCallback(() => {
        initProductPage();
    });
    isProducts = true;
    isDOC = false;
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
                        filteredProducts = filteredProducts.filter(product => product.costPrice >= 0 && product.costPrice <= 1);
                        break;
                    case "medium-price":
                        filteredProducts = filteredProducts.filter(product => product.costPrice > 1 && product.costPrice <= 5);
                        break;
                    case "high-price":
                        filteredProducts = filteredProducts.filter(product => product.costPrice > 5);
                        break;
                }
            }

            const stockRange = stockSelect.value;
            if (stockRange) {
                switch (stockRange) {
                    case "low-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock >= 0 && product.stock <= 5);
                        break;
                    case "medium-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock > 5 && product.stock <= 30);
                        break;
                    case "high-stock":
                        filteredProducts = filteredProducts.filter(product => product.stock > 30);
                        break;
                }
            }

            const profitRange = profitSelect.value;
            if (profitRange) {
                switch (profitRange) {
                    case "low-profit":
                        filteredProducts = filteredProducts.filter(product => product.profit >= 0 && product.profit <= 0.1);
                        break;
                    case "medium-profit":
                        filteredProducts = filteredProducts.filter(product => product.profit > 0.1 && product.profit <= 1);
                        break;
                    case "high-profit":
                        filteredProducts = filteredProducts.filter(product => product.profit > 1);
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
                productsGrid.innerHTML += productCard(product);
            });
        };

        const resetFilters = document.getElementById("reset-filters");
        if (resetFilters) {
            resetFilters.addEventListener("click", () => {
                document.getElementById("category-select").value = "";
                document.getElementById("price-select").value = "";
                document.getElementById("stock-select").value = "";
                document.getElementById("profit-select").value = "";
                document.getElementById("sort-by-price-stock-profit").value = "";
                applyFilters();
            });
        }

        categorySelect.addEventListener("change", applyFilters);
        priceSelect.addEventListener("change", applyFilters);
        stockSelect.addEventListener("change", applyFilters);
        profitSelect.addEventListener("change", applyFilters);
        sortByPriceStockProfit.addEventListener("change", applyFilters);

        renderProducts(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}
function renderFilters() {
    console.log("test");
    const mainContent = document.querySelector(".main-content");
    const oneCostPrice = convertCurrency(1, "$", "LBP");
    const oneCostPriceFormatted = formatCompactNumber(oneCostPrice);
    const fiveCostPrice = convertCurrency(5, "$", "LBP");
    const fiveCostPriceFormatted = formatCompactNumber(fiveCostPrice);
    const centProfit = convertCurrency(0.1, "$", "LBP");
    const centProfitFormatted = formatCompactNumber(centProfit);
    mainContent.innerHTML = `
        <div id="filter-options" class="filter-options">
            <div class="filter-group">
                <label for="category-select">Filter Category:</label>
                <select id="category-select">
                    <option value="">All Categories</option>
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

            <div class="filter-group">
                <label for="price-select">Filter Price (${storeCurrency}):</label>
                <select id="price-select" style="display: none;">
                  <option value="">All Prices</option>
                  <option value="low-price">Low Price </option>
                  <option value="medium-price">Medium Price </option>
                  <option value="high-price">High Price </option>
                </select>

                <div id="price-buttons" class="button-group">
                  <button class="filter-btn" data-value="">All Prices</button>
                  <button class="filter-btn" data-value="low-price">
                  Low Price ${storeCurrency === "$" ? '(0-1)' : '(0-' + oneCostPriceFormatted + ')'}</button>
                  <button class="filter-btn" data-value="medium-price">
                  Medium Price ${storeCurrency === "$" ? '(1-5)' : '(' + oneCostPriceFormatted + '-' + fiveCostPriceFormatted + ')'}</button>
                  <button class="filter-btn" data-value="high-price">
                  High Price ${storeCurrency === "$" ? '(5+)' : '(' + fiveCostPriceFormatted + '+)'}</button>
                </div>
            </div>

            <div class="filter-group">
                <label for="profit-select">Filter Profit (${storeCurrency}):</label>
                <select id="profit-select" style="display: none;">
                  <option value="">All Profits</option>
                  <option value="low-profit">Low profit (0-10)</option>
                  <option value="medium-profit">Medium Profit (11-20)</option>
                  <option value="high-profit">High Profit (21+)</option>
                </select>

                <div id="profit-buttons" class="button-group">
                  <button class="filter-btn" data-value="">All Profits</button>
                  <button class="filter-btn" data-value="low-profit">
                  Low profit ${storeCurrency === "$" ? '(0-0.1)' : '(0-' + centProfitFormatted + ')'}</button>
                  <button class="filter-btn" data-value="medium-profit">
                  Medium Profit ${storeCurrency === "$" ? '(0.1-1)' : '(' + centProfitFormatted + '-' + oneCostPriceFormatted + ')'}</button>
                  <button class="filter-btn" data-value="high-profit">
                  High Profit ${storeCurrency === "$" ? '(1+)' : '(' + oneCostPriceFormatted + '+)'}</button>
                </div>
            </div>

            <div class="filter-group">
                <label for="stock-select">Filter Stock:</label>
                <select id="stock-select" style="display: none;">
                  <option value="">All Stocks</option>
                  <option value="low-stock">Low Stock (0-5)</option>
                  <option value="medium-stock">Medium Stock (6-30)</option>
                  <option value="high-stock">High Stock (30+)</option>
                </select>

                <div id="stock-buttons" class="button-group">
                  <button class="filter-btn" data-value="">All Stocks</button>
                  <button class="filter-btn" data-value="low-stock">Low Stock (0-5)</button>
                  <button class="filter-btn" data-value="medium-stock">Medium Stock (6-30)</button>
                  <button class="filter-btn" data-value="high-stock">High Stock (30+)</button>
                </div>
            </div>

            <div class="products-actions">
                <button id="reset-filters" type="button" class="func-btn">Reset Filters</button>    
                <button class="export-btn" style="color: var(--btnText-color);" id="export-product-btn">EXPORT</button>
            </div>
        </div>
        <div id="products-grid" class="products-grid"></div>
    `;
}
function productCard(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.img}" alt="${product.label}">
            </div>
            <div class="product-details">
                <p><strong>Label:</strong> ${product.label}</p>
                <p><strong>Barcode:</strong> ${product.barcode}</p>
                <p><strong>Cost Price:</strong> ${displayCurrency(product.costPrice)}</p>
                <p><strong>Profit:</strong> ${displayCurrency(product.profit)}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Stock:</strong> ${product.stock}</p>
                <p><strong>Created At:</strong> ${product.createdAt}</p>
            </div>
        </div>
    `;
}
function fetchProductsForDoc() {
    isDOC = true;
    isProducts = false;
    return db.collection("products").get().then((querySnapshot) => {
        let products = [];
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            products.push({
                id: doc.id,
                label: data.label,
                barcode: data.barcode,
                costPrice: data.costPrice || 0,
                profit: data.profit || 0,
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
    setCurrencyUpdateCallback(() => {
        displayProducts(filteredProducts);
    });
    const productCardsHTML = filteredProducts.map(product => productCard(product)).join("");

    const productsGridHTML = `
        <div id="products-grid" class="products-grid">
            ${productCardsHTML}
        </div>
    `;

    $(".main-content").html(productCardsHTML ? productsGridHTML : "<p>No products found.</p>");

    // Attach click handler only if there are products
    if (productCardsHTML) {
        $(".product-card").on("click", function () {
            const productId = $(this).data("id");
            const product = allProducts.find(p => p.id === productId);
            displayProductForm(product);
        });
    }
}

function refreshProductList() {
    console.log("refresh");
    fetchProductsForDoc().then((products) => {
        allProducts = products;
    });
}
$(document).ready(function () {
    fetchProductsForDoc().then(products => {
        allProducts = products;
        displayProducts(products);
    });
    $(".search-bar").on("input", function () {
        isDOC = true;
        let searchText = $(this).val().toLowerCase().trim();
        let filtered = allProducts.filter(product =>
            product.label.toLowerCase().startsWith(searchText)
        );
        displayProducts(filtered);
    });
});
//TODO: ehance forms valitdation after adding currency.
//NOTE: add validation when currency is in LBP or $.
//TODO: remove the returned $ from displayCurrency and added manually.
let isProductForm = false;
function displayProductForm(product) {
    setCurrencyUpdateCallback(() => {
        displayProductForm(product);
    });
    isProductForm = true;
    const formHtml = `
        <div class = "header-container">
            <h5 style="font-weight: bolder">Update Product</h5>
            <button type="button" id="done-btn">Done</button>
        </div>
        <form id="product-form" class="product-form">

            <input type="hidden" name="formType" value="update">

            <label for="barcode">Barcode:</label>
            <input type="text" id="barcode" name="barcode" value="${product.barcode}">

            <label for="label">Label:</label>
            <input type="text" id="label" name="label" value="${product.label}">
            
            <div class="file-container">
                <label for="img">Image: <span id="fileName">No file selected!</span> </label>
                <input type="file" id="img" name="img" accept="image/*" capture="environment" class="file-input">
                <button type="button" id="customFileButton">Update Image:</button>
            </div>
            
            <label for="costPrice">Cost Price (${storeCurrency}):</label>
            <input type="text" id="costPrice" name="costPrice" value="${displayCurrency(product.costPrice)}">

            <label for="profit">Profit (${storeCurrency}):</label>
            <input type="text" id="profit" name="profit" value="${displayCurrency(product.profit)}">
            
            <label for="category">Category:</label>
            <input type="text" id="category" name="category" value="${product.category}">
            
            <label for="stock">Stock:</label>
            <input type="text" id="stock" name="stock" value="${product.stock}">
            
            <button type="submit" class="action-btn" id="update-button">Update</button>
            <button type="button" class="action-btn" id="remove-button">Remove Product</button>
        </form>
    `;

    $(".main-content").html(formHtml);

    const fileInput = document.getElementById("img");
    const customFileButton = document.getElementById("customFileButton");
    const fileNameSpan = document.getElementById("fileName");

    customFileButton.addEventListener("click", () => {
        fileInput.click();
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

        const form = document.getElementById("product-form");
        const formData = new FormData(form);

        clearFieldErrors(); // Clear previous errors

        const { hasError, errors, values } = validateProductForm(formData);

        if (hasError) {
            for (let fieldId in errors) {
                setFieldError(fieldId, errors[fieldId]);
            }
            showModalMessage(`<p>Failed to update product!</p><p>Check the input fields.</p>`);
            return;
        }

        const {
            rawBarcode,
            rawLabel,
            rawCostPrice,
            rawProfit,
            rawCategory,
            rawStock,
            imageFile
        } = values;

        const rawCostPriceToUSD = storeCurrency === "LBP" ? convertCurrency(rawCostPrice, "LBP", "$") : rawCostPrice;
        const rawProfitToUSD = storeCurrency === "LBP" ? convertCurrency(rawProfit, "LBP", "$") : rawProfit;
        const updatedProduct = {
            label: rawLabel,
            barcode: parseInt(rawBarcode),
            costPrice: parseFloat(rawCostPriceToUSD),
            profit: parseFloat(rawProfitToUSD),
            category: rawCategory,
            stock: parseInt(rawStock, 10),
            img: imageFile?.name || product.img // Keep old image if not updated
        };


        //other code to handle the submitting after validation...
        const file = $("#img")[0].files[0];
        if (file && file.size > 0) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const maxWidth = 250;
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

                                            showModalMessage("Product Updated Successfully!", true);
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

            reader.readAsDataURL(file);
        } else {
            db.collection("products").doc(product.id).update(updatedProduct)
                .then(() => {

                    showModalMessage("Product Updated Successfully!", true);
                })
                .catch(error => {
                    console.error("Error updating product:", error);
                });
        }
        refreshProductList();
        setTimeout(() => {
            displayProducts(allProducts);
        }, 500);
    });

    $("#done-btn").on("click", function () {
        displayProducts(allProducts);
    });
    $("#remove-button").on("click", function () {
        removeProductFromFirebase(product.id);
    });
}
function removeProductFromFirebase(productId) {
    db.collection("products").doc(productId).delete()
        .then(() => {

            showModalMessage("Product Removed Successfully!", true);
            refreshProductList();
            displayProducts(allProducts);
        })
        .catch(error => {
            console.error("Error removing product:", error);
        });
}
// #endregion }

// #region 2️⃣ Customers Section {
function initCustomersPage() {
    setCurrencyUpdateCallback(() => {
        initCustomersPage();
    });
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

    try {
        const customersSnapshot = await db.collection("customers").get();
        customersGrid.innerHTML = "";

        customersSnapshot.forEach((doc) => {
            const customer = { id: doc.id, ...doc.data() };

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
    } catch (error) {
        customersGrid.innerHTML = `<p>Error fetching customers: ${error.message}</p>`;
    }
}
async function displayCustomerDetails(customerId, customerName, customerPhone) {
    setCurrencyUpdateCallback(() => {
        displayCustomerDetails(customerId, customerName, customerPhone);
    });
    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = `
        <div class="header-container">
            <h5 style="font-weight: bolder">Customer Info</h5>
            <button type="button" id="cancel-customer-btn">Done</button>
        </div>
        <form id="customer-form" class="product-form">
            <label for="customer-name">Name:</label>
            <input type="text" id="customer-name" value="${customerName}" required />

            <label for="customer-phone">Phone Number:</label>
            <input type="text" id="customer-phone" value="${customerPhone}" required />

            <button type="button" class="action-btn" id="edit-customer-btn">Edit Customer</button>
            <button type="button" class="action-btn" id="remove-customer-btn">Remove Customer</button>
        </form>

        <div id="customer-table" class="customer-table">
            <p>Customer's Debt</p>
            <table>
                <thead>
                    <tr>
                        <th>Details</th>
                        <th>Balance (${storeCurrency})</th>
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
                <td>${displayCurrency(debt.balance)}</td>
                <td>${new Date(debt.createdAt.seconds * 1000).toLocaleString()}</td>
                <td><button class="remove-debt-btn" data-debt-id="${doc.id}">Remove</button></td>
            `;
            debtDetailsTable.appendChild(debtRow);
            totalBalance += debt.balance;
        });
        const totalBalanceFormatted = displayCurrency(totalBalance);
        totalBalanceElement.textContent = totalBalanceFormatted;

        document.querySelectorAll(".remove-debt-btn").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const debtId = event.target.getAttribute("data-debt-id");
                await db.collection("customers").doc(customerId).collection("debts").doc(debtId).delete();
                loadDebts();
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
        renderAddDebtForm();
        document.getElementById("cancel-debt-btn").addEventListener("click", () => {
            console.log("clicked");
            displayCustomerDetails(customerId, customerName, customerPhone);
        });
        setCurrencyUpdateCallback(() => {
            renderAddDebtForm();
            document.getElementById("cancel-debt-btn").addEventListener("click", () => {
                console.log("clicked");
                displayCustomerDetails(customerId, customerName, customerPhone);
            });
        });
    });
}
function renderAddDebtForm() {
    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = `
    <form id="customer-debt" class="product-form">
        <label for="debt-details">Details:</label>
        <input type="text" id="debt-details" required />
        <label for="debt-balance">Balance (${storeCurrency}):</label>
        <input type="text" id="debt-balance" required />
        <button type="submit" class="action-btn">Add</button>
        <button type="button" style="margin-top: 10px;" class="func-btn" id="cancel-debt-btn">Go Back</button>
    </form>
`;
    document.getElementById("customer-debt").addEventListener("submit", async (event) => {
        event.preventDefault();
        const details = document.getElementById("debt-details").value.trim();
        const balance = parseFloat(document.getElementById("debt-balance").value.trim());
        const balanceConverted = storeCurrency === "LBP" ? convertCurrency(balance, "LBP", "$") : balance;
        console.log("balance: ", balance);
        console.log("balance formatted: ", balanceConverted);

        if (!details || isNaN(balance) || balance <= 0) {
            showModalMessage("Invalid input. Please enter valid details and balance!", false);
            return;
        }

        try {
            await db.collection("customers").doc(customerId).collection("debts").add({
                details,
                balance: balanceConverted,
                createdAt: firebase.firestore.Timestamp.now(),
            });
            showModalMessage("Debt added successfully!", true);
            document.getElementById("customer-debt").reset();
        } catch (error) {
            showModalMessage(`Error adding debt: ${error.message}`, false);
        }
    });
}
// #endregion }

// #region 3️⃣ Cart And Sales Section {
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
// #region Carts Section {
async function fetchCartsData() {

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
                <p><strong>Total Cost:</strong> $${cart.totalCost}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
            </div>
            <div class="hidden-products" id="products-${cart.id}">
            </div>
        `;

        // Later we’ll add click listeners to toggle product visibility and fetch
        cartsTable.appendChild(cartDiv);
    });



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

                productsContainer.classList.remove("show");
                return;
            }

            // If already loaded once, just show
            if (productsContainer.dataset.loaded === "true") {

                productsContainer.classList.add("show");

                return;
            }


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
                                <p>Cost Price: $${p.costPrice}</p>
                                <p>Total: $${p.total}</p>
                            </div>
                        `;
                    }).join("");

                    productsContainer.innerHTML = `${productItems}`;
                }

                productsContainer.classList.add("show");
                productsContainer.dataset.loaded = "true";

            } catch (error) {
                console.error(`Error loading products for cart ${cartId}:`, error);
                productsContainer.innerHTML = "<p>Error loading products.</p>";
            }
        });
    });


}
// #endregion }

// #region Sales Section
async function loadSalesData() {
    const salesContainer = document.getElementById("sales-container");
    if (!salesContainer)
        return;

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

    const salesData = await fetchSalesData();
    populateDropdown(salesData);
    renderSalesTable(salesData);

    const salesDateSelect = document.getElementById("sales-date-select");
    if (!salesDateSelect)
        return;

    salesDateSelect.addEventListener("change", function () {
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

        productsSold.sort((a, b) => {
            const aTime = a.dateSold?.toDate?.().getTime?.() || 0;
            const bTime = b.dateSold?.toDate?.().getTime?.() || 0;
            return bTime - aTime;
        });

        salesData.push({
            salesDate,
            createdAt: salesInfo.createdAt,
            totalProductsSold: salesInfo.totalProductsSold,
            totalRevenue: salesInfo.totalRevenue,
            totalProfit: salesInfo.totalProfit,
            productsSold
        });
    }
    salesData.sort((a, b) => {
        const dateA = new Date(a.salesDate);
        const dateB = new Date(b.salesDate);
        return dateB - dateA;
    });

    return salesData;
}
function renderSalesTable(salesData) {
    const container = document.getElementById("sales-table-container");
    if (!container)
        return;
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
                    ? product.dateSold.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : "N/A";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.name || "N/A"}</td>
                    <td>${date}</td>
                    <td>$${(product.costPrice ?? 0)}</td>
                    <td>${product.quantity ?? 0}</td>
                    <td>$${(product.total ?? 0)}</td>
                    <td>$${(product.totalProfit ?? 0)}</td>
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
                <td><strong>$${sale.totalRevenue}</strong></td>
                <td><strong>$${sale.totalProfit}</strong></td>
            </tr>
        `;

        const tableActions = document.createElement("div");
        tableActions.classList.add("table-actions");
        tableActions.innerHTML = `
            <button type="button" class="export-sales">Export</button>
        `;

        const exportButton = tableActions.querySelector(".export-sales");
        exportButton.addEventListener("click", event => exportSalesTableToPDF(event));

        table.appendChild(thead);
        table.appendChild(tbody);
        table.appendChild(tfoot);

        container.appendChild(document.createElement("hr"));
        const header = document.createElement("h3");
        header.textContent = `Sales on ${sale.salesDate}`;
        container.appendChild(header);
        container.appendChild(table);
        container.appendChild(tableActions);
    });
}
function populateDropdown(salesData) {
    const optGroup = document.getElementById("specific-dates-group");
    if (!optGroup)
        return;

    optGroup.innerHTML = "";
    salesData.forEach(sale => {
        const option = document.createElement("option");
        option.value = sale.salesDate;
        option.textContent = sale.salesDate;
        optGroup.appendChild(option);
    });
}
function filterSales(salesData, filterType) {
    const todayDate = new Date();
    const todayStr = todayDate.toLocaleDateString('en-CA');

    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toLocaleDateString('en-CA');

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
    return salesData;
}

// #endregion
// #endregion }

// #region 4️⃣ Dashboard Section {
function initDashboard() {
    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = `
        <div class="inventory-analytics" id="inventory-analytics">
            <!-- Category Distrubtion -->
            <div id="category-chart-container" class="category-chart-container">
                <h2>Category Distribution</h2>
                <canvas id="categoryChart"></canvas>
            </div>
            <hr>

            <!-- Sales Comparison Chart -->
            <div id="sales-comparison">
                <h2>Sales Comparison</h2>
                <div><canvas id="revenueChart" height = "300"></canvas></div>
                <div><canvas id="profitChart" height = "300"></canvas></div>
                <div><canvas id="quantityChart" height = "300"></canvas></div>
            </div>
            <hr>

            <!-- Sales Trend Chart -->
            <div id="sales-trend">
                <h2>Sales Over Time</h2>
                <div class="filter-container">
                    <label for="startDate">Start: </label>
                    <input type="date" id="startDate" class="func-btn" name="startDate">
                    <label for="endDate">End: </label>
                    <input type="date" id="endDate" class="func-btn" name="endDate">
                    <button id="applyDateRange" class="func-btn" >Apply</button>
                </div>
                <canvas id="salesTrendChart" height = "350"></canvas>
                <p><strong class="profit-growth">Profit Growth: </strong><span id="profit-growth"></span></p>
                <p><strong class="products-sold-growth">Products Sold Growth: </strong><span id="products-sold-growth"></span></p>
            </div>
            <hr>

            <!-- Profitability Analysis Section -->
            <div id="profitability-analysis" class="profitability-analysis">
                <h2>Profit Margin</h2>
                <div id="profit-margin-chart-container" class="chart-container">
                    <h5 style="color: rgba(75, 192, 192, 1)">Product Margin Distribution</h5>
                    <canvas id="profitMarginChart" height = "300"></canvas>
                </div>
                <p><strong>Highest Profit Margin: </strong><span id="highest-profit-margin"></span></p>
                <p><strong>Lowest Profit Margin: </strong><span id="lowest-profit-margin"></span></p>
                <p><strong>Average Profit Margin: </strong><span id="average-profit-margin"></span></p>
            </div>
            <hr>

            <!-- Product Lifecycle Analysis Section -->
            <div id="product-lifecycle-analysis" class="product-lifecycle-analysis">
                <h2>Product Lifecycle</h2>
                <div id="product-age-chart-container" class="chart-container">
                    <h5 style="color: rgba(54, 162, 235, 1);">Product Age Distribution</h5>
                    <canvas id="productAgeChart" height = "300"></canvas>
                </div>
                <p><strong>Average Product Age (Days): </strong><span id="average-product-age"></span></p>
            </div>
            <hr>

            <!-- Most Popular Products by Sales -->
            <div id="most-popular-products" class>
                <h2>Most Popular</h2>
                <div id="most-popular-products-chart-container" class="chart-container">
                    <h5 style="color: rgba(153, 102, 255, 1);">Top 5 Most Sold Products</h5>
                    <canvas id="mostPopularProductsChart" height = "300"></canvas>
                </div>
            </div>
            <hr>

            <!-- Least Popular Products by Sales -->
            <div id="least-popular-products">
                <h2>Least Popular</h2>
                <div id="least-popular-products-chart-container" class="chart-container">
                    <h5 style="color: rgba(255, 159, 64, 1);">Bottom 5 Least Sold Products</h5>
                    <canvas id="leastPopularProductsChart" height = "300"></canvas>
                </div>
            </div>
            <hr>

            <div id="smart-insights"></div>
            <button id="exportAllChartsBtn" class="export-btn">Export All Dashboard Charts</button>
            <hr>

            <!-- Inventory Analytics -->
            <div id="inventory-metrics" class="inventory-metrics">
                <h2>Inventory Summary</h2>
                <table class="low-stock-table">
                    <tbody>
                        <tr>
                            <th>Total Products</th>
                            <td id="total-products"><span>Loading...</span></td>
                        </tr>
                        <tr>
                            <th>Total Stock Units</th>
                            <td id="total-stock-units"><span>Loading...</span></td>
                        </tr>
                        <tr>
                            <th>Total Inventory Value</th>
                            <td id="inventory-value"><span>Loading...</span></td>
                        </tr>
                        <tr>
                            <th>Highest Sales Day</th>
                            <td id="highest-sales-day"><span>Loading...</span></td>
                        </th>
                        <tr>
                            <th>Lowest Sales Day</th>
                            <td id="lowest-sales-day"><span>Loading...</span></td>
                        </th>
                        <tr>
                            <th>Average Order Value</th>
                            <td id="average-order-value"><span>Loading...</span></td>
                        </th>
                        <tr>
                            <th>Out of Stock</th>
                            <td id="out-of-stock"><span>Loading...</span></td>
                        </tr>
                        <tr>
                            <th>Low Stock Products</th>
                            <td id="low-stock"><span>Loading...</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <hr>

            <div id="low-stock-list" class="low-stock-list">
                <h2>Low Stock Products</h2>
                <table class="low-stock-list-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody id="low-stock-products"></tbody>
                </table>
            </div>

        </div>
    `;
    const apply = document.getElementById("applyDateRange");
    document.getElementById('applyDateRange').addEventListener('click', async () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            showModalMessage("Please select both the start and end dates!", false);
            apply.style.color = "rgba(255, 99, 132, 1)";
            apply.textContent = "Not Applied ❌";
            return;
        }
        apply.style.color = "rgba(53, 162, 235, 1)";
        apply.textContent = "Applied ✅";
        await fetchSalesOverTimeForRange(startDate, endDate);

    });

    document.getElementById("exportAllChartsBtn").addEventListener("click", exportAllChartsAsPDF);

    fetchComparisonSales();

    fetchCategoryDistribution();

    fetchYearlyProfitTrend();

    fetchProfitabilityData();

    fetchProductLifecycleData();

    fetchMostPopularProducts();

    fetchLeastPopularProducts();

    fetchSalesDataAndRenderInsights();

    fetchInventorySummary();
}
// #region Category Disribution {
async function fetchCategoryDistribution() {
    const snapshot = await db.collection("products").get();
    const categoryCounts = {};

    snapshot.forEach(doc => {
        const data = doc.data();
        const category = data.category || "Uncategorized";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    renderCategoryChart(categoryCounts);
}
function renderCategoryChart(categoryCounts) {
    const canvasId = 'categoryChart';
    const ctx = document.getElementById(canvasId).getContext("2d");

    // 💥 Destroy existing chart if it exists
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);

    chartInstances[canvasId] = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: "Products by Category",
                data: data,
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)"
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 2000,
                easing: 'easeOutCubic'
            },
            plugins: {
                legend: {
                    position: "top",
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw} products`;
                        }
                    }
                }
            }
        }
    });
}

// #endregion }

// #region Sales Comparisons {
let isFetching = false;
const activeCharts = {};
let isFetchingComparison = false;
async function fetchComparisonSales() {
    // Prevent duplicate concurrent requests
    if (isFetchingComparison) return;
    isFetchingComparison = true;

    try {
        // Fetch all periods in parallel
        const [today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
            fetchSalesForPeriod("today"),
            fetchSalesForPeriod("yesterday"),
            fetchSalesForPeriod("thisWeek"),
            fetchSalesForPeriod("lastWeek"),
            fetchSalesForPeriod("thisMonth"),
            fetchSalesForPeriod("lastMonth")
        ]);

        const comparisonData = {
            today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth
        };

        // Render all charts (reusing existing instances)
        renderComparisonChart(comparisonData, 'totalRevenue', 'revenueChart', 'Revenue');
        renderComparisonChart(comparisonData, 'totalProfit', 'profitChart', 'Profit');
        renderComparisonChart(comparisonData, 'totalProductsSold', 'quantityChart', 'Quantity');

    } catch (error) {
        console.error("Error in fetchComparisonSales:", error);
    } finally {
        isFetchingComparison = false;
    }
}
const dateRangeCache = {};
function getDateRange(period) {
    if (dateRangeCache[period]) return dateRangeCache[period];
    const today = new Date();

    let startDate = new Date();
    let endDate = today;

    if (period === "today") {
        startDate = today;
        endDate = today;
    } else if (period === "yesterday") {
        startDate.setDate(today.getDate() - 1);
        endDate = startDate;
    } else if (period === "thisWeek") {
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        endDate = today;
    } else if (period === "lastWeek") {
        startDate.setDate(today.getDate() - today.getDay() - 7); // Start of last week
        endDate.setDate(today.getDate() - today.getDay() - 1);   // End of last week (Saturday)
    } else if (period === "thisMonth") {
        startDate.setDate(1); // 1st day of current month
        endDate = today;
    } else if (period === "lastMonth") {
        startDate.setMonth(today.getMonth() - 1, 1); // 1st day of last month
        endDate.setMonth(today.getMonth(), 0);       // Last day of last month
    }

    dateRangeCache[period] = { startDate: formatDate(startDate), endDate: formatDate(endDate) };
    return dateRangeCache[period];
}
function formatDate(date) {
    if (!(date instanceof Date)) date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function getDatesBetween(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        dates.push(formatDate(new Date(current))); // Explicitly format each date
        current.setDate(current.getDate() + 1);
    }

    return dates;
}
async function fetchSalesForPeriod(period) {
    const { startDate, endDate } = getDateRange(period);
    const dates = getDatesBetween(startDate, endDate);

    // Fetch all documents in parallel
    const promises = dates.map(date =>
        db.collection("sales").doc(date).get()
    );
    const docs = await Promise.all(promises);

    let totalRevenue = 0, totalProductsSold = 0, totalProfit = 0;
    docs.forEach(doc => {
        if (doc.exists) {
            const data = doc.data();
            totalRevenue += data.totalRevenue || 0;
            totalProductsSold += data.totalProductsSold || 0;
            totalProfit += data.totalProfit || 0;
        }
    });

    return { totalRevenue, totalProductsSold, totalProfit };
}
const chartInstances = {};
function renderComparisonChart(comparisonData, metric, canvasId, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element #${canvasId} not found`);
        return;
    }

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Today vs Yesterday", "This Week vs Last Week", "This Month vs Last Month"],
            datasets: [
                {
                    label: `Current Period ${title}`,
                    data: [
                        comparisonData.today[metric],
                        comparisonData.thisWeek[metric],
                        comparisonData.thisMonth[metric]
                    ],
                    backgroundColor: 'rgba(53, 162, 235, 0.9)',
                    borderColor: 'rgba(53, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: `Previous Period ${title}`,
                    data: [
                        comparisonData.yesterday[metric],
                        comparisonData.lastWeek[metric],
                        comparisonData.lastMonth[metric]
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.9)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            animation: {
                duration: 7000,
                easing: 'easeOutCubic'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: title }
                },
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}
// #endregion }

// #region Sales Over Time {
function fetchYearlyProfitTrend() {
    const salesRef = db.collection("sales");
    salesRef.get().then(snapshot => {
        const docs = [];
        snapshot.forEach(doc => docs.push(doc));
        processSalesDocsAndRender(docs);
    }).catch(error => {
        console.error("Error fetching yearly profit trend:", error);
    });
}
async function fetchSalesOverTimeForRange(startDate, endDate) {


    const dates = getDatesBetween(startDate, endDate);
    const promises = dates.map(date =>
        db.collection("sales").doc(date).get()
    );

    try {
        const docs = await Promise.all(promises);
        processSalesDocsAndRender(docs);
    } catch (error) {
        console.error("Error fetching sales for range:", error);
    }
}
function processSalesDocsAndRender(docs) {
    const profitData = [];

    docs.forEach(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        const profit = data.totalProfit || 0;
        const totalProductsSold = data.totalProductsSold || 0;

        profitData.push({
            date: new Date(doc.id),
            profit,
            productsSold: totalProductsSold
        });
    });

    // Sort by date ascending
    profitData.sort((a, b) => a.date - b.date);

    const labels = profitData.map(entry => {
        const date = entry.date; // Ensure `entry.date` is a JavaScript Date object
        return date.getDate(); // Returns day number (1-31)
    });
    const profits = profitData.map(entry => entry.profit);
    const productsSold = profitData.map(entry => entry.productsSold);

    calculateAndDisplayGrowth(profits, productsSold);
    renderProfitTrendChart(labels, profits, productsSold);
}
function calculateAndDisplayGrowth(profits, productsSold) {
    let profitGrowth = 0;
    let productsSoldGrowth = 0;

    if (profits.length >= 2) {
        const firstProfit = profits[0];
        const lastProfit = profits[profits.length - 1];

        const firstSold = productsSold[0];
        const lastSold = productsSold[productsSold.length - 1];

        profitGrowth = firstProfit === 0 ? 0 : ((lastProfit - firstProfit) / firstProfit) * 100;
        productsSoldGrowth = firstSold === 0 ? 0 : ((lastSold - firstSold) / firstSold) * 100;
    }

    document.getElementById("profit-growth").textContent = `${profitGrowth}%`;
    document.getElementById("products-sold-growth").textContent = `${productsSoldGrowth}%`;
}
function renderProfitTrendChart(labels, profits, productsSold) {
    const canvasId = 'salesTrendChart';
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element #${canvasId} not found`);
        return;
    }

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    // Create data points
    const profitData = labels.map((label, i) => ({
        x: label,
        y: profits[i],
        productsSold: productsSold[i]
    }));

    const productsSoldData = labels.map((label, i) => ({
        x: label,
        y: productsSold[i]
    }));

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Total Profit',
                    data: profitData,
                    fill: false,
                    borderColor: 'rgba(0, 255, 34, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3,
                    pointRadius: 3,
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Total Products Sold',
                    data: productsSoldData,
                    fill: false,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    tension: 0.3,
                    pointRadius: 3,
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Profit & Products Sold Trend'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.label === 'Total Profit') {
                                return `Profit: $${context.parsed.y}`;
                            } else if (context.dataset.label === 'Total Products Sold') {
                                return `Products Sold: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Day',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 8
                        }
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Profit ($)',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 8
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Products Sold',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 8
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}
// #endregion }

//#region Proftability Margin {
function fetchProfitabilityData() {
    const productsRef = db.collection("products");
    let products = [];
    productsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const profitMargin = (data.profit / (data.costPrice + data.profit)) * 100;
            products.push({
                label: data.label,
                costPrice: data.costPrice,
                profit: data.profit,
                profitMargin: profitMargin
            });
        });

        renderProfitabilityMetrics(products);
        renderProfitMarginChart(products);
    }).catch((error) => {
        console.error("Error fetching products:", error);
    });
}
function renderProfitabilityMetrics(products) {
    const highestProfitMargin = Math.max(...products.map(product => product.profitMargin));
    const lowestProfitMargin = Math.min(...products.map(product => product.profitMargin));
    const averageProfitMargin = products.reduce((acc, product) => acc + product.profitMargin, 0) / products.length;

    document.getElementById("highest-profit-margin").textContent = `${highestProfitMargin}%`;
    document.getElementById("lowest-profit-margin").textContent = `${lowestProfitMargin}%`;
    document.getElementById("average-profit-margin").textContent = `${averageProfitMargin}%`;
}
function renderProfitMarginChart(products) {
    const canvasId = 'profitMarginChart';
    const ctx = document.getElementById(canvasId).getContext('2d');

    // 💥 Destroy existing chart if it exists
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const labels = products.map(product => product.label);
    const profitMargins = products.map(product => product.profitMargin);

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Profit Margin (%)',
                data: profitMargins,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxRotation: 90,
                        minRotation: 90
                    }
                }
            }
        }
    });
}

// #endregion }

// #region Products Lifecycle {
function fetchProductLifecycleData() {
    const productsRef = db.collection("products");
    let products = [];
    productsRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt.toDate(); // Convert Firestore timestamp to Date
            const currentDate = new Date();
            const ageInDays = Math.floor((currentDate - createdAt) / (1000 * 3600 * 24)); // Age in days
            products.push({
                label: data.label,
                createdAt: createdAt,
                ageInDays: ageInDays
            });
        });

        renderProductLifecycleMetrics(products);
        renderProductAgeChart(products);
    }).catch((error) => {
        console.error("Error fetching products:", error);
    });
}
function renderProductLifecycleMetrics(products) {
    const totalAge = products.reduce((acc, product) => acc + product.ageInDays, 0);
    const averageAge = totalAge / products.length;

    document.getElementById("average-product-age").textContent = averageAge;
}
function renderProductAgeChart(products) {
    const canvasId = 'productAgeChart';
    const ctx = document.getElementById(canvasId).getContext('2d');

    // 💥 Destroy existing chart if it exists
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const labels = products.map(product => product.label);
    const ages = products.map(product => product.ageInDays);

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Product Age (Days)',
                data: ages,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxRotation: 90,
                        minRotation: 90
                    }
                }
            }
        }
    });
}

// #endregion }

// #region Most Popular Products {
function fetchMostPopularProducts() {
    const salesRef = db.collection("sales");
    let productSales = {};

    salesRef.get().then((querySnapshot) => {
        const salesPromises = [];

        querySnapshot.forEach((doc) => {
            const productsSoldRef = db.collection("sales").doc(doc.id).collection("productsSold");

            const promise = productsSoldRef.get().then((productsSnapshot) => {
                productsSnapshot.forEach((productDoc) => {
                    const product = productDoc.data();
                    const productId = product.name;
                    const quantitySold = product.quantity;

                    if (productSales[productId]) {
                        productSales[productId] += quantitySold;
                    } else {
                        productSales[productId] = quantitySold;
                    }
                });
            });

            salesPromises.push(promise);
        });

        Promise.all(salesPromises).then(() => {
            renderMostPopularProductsChart(productSales);
        }).catch((error) => {
            console.error("Error fetching productsSold subcollections:", error);
        });
    }).catch((error) => {
        console.error("Error fetching sales data:", error);
    });
}
function renderMostPopularProductsChart(productSales) {
    // Convert the aggregated productSales object to arrays for labels and data
    const labels = Object.keys(productSales); // Product names (or IDs)
    const salesVolumes = Object.values(productSales); // Total quantity sold for each product

    // Sort the products by sales volume in descending order and slice to top 5
    const topProducts = labels
        .map((label, index) => ({
            label: label,
            salesVolume: salesVolumes[index]
        }))
        .sort((a, b) => b.salesVolume - a.salesVolume)
        .slice(0, 5); // Get top 5

    const topLabels = topProducts.map(product => product.label);
    const topSalesVolumes = topProducts.map(product => product.salesVolume);

    const ctx = document.getElementById('mostPopularProductsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topLabels,
            datasets: [{
                label: 'Quantity Sold',
                data: topSalesVolumes,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxRotation: 90,
                        minRotation: 90
                    }
                }
            }
        }
    });
}

// #endregion }

// #region Least Poplular Products {
function fetchLeastPopularProducts() {
    const salesRef = db.collection("sales");
    let productSales = {};

    salesRef.get().then((querySnapshot) => {
        const salesPromises = [];

        querySnapshot.forEach((doc) => {
            const productsSoldRef = db.collection("sales").doc(doc.id).collection("productsSold");

            const promise = productsSoldRef.get().then((productsSnapshot) => {
                productsSnapshot.forEach((productDoc) => {
                    const product = productDoc.data();
                    const productId = product.name;
                    const quantitySold = product.quantity;

                    if (productSales[productId]) {
                        productSales[productId] += quantitySold;
                    } else {
                        productSales[productId] = quantitySold;
                    }
                });
            });

            salesPromises.push(promise);
        });

        Promise.all(salesPromises).then(() => {
            renderLeastPopularProductsChart(productSales);
        }).catch((error) => {
            console.error("Error fetching productsSold subcollections:", error);
        });
    }).catch((error) => {
        console.error("Error fetching sales data:", error);
    });
}
function renderLeastPopularProductsChart(productSales) {
    const canvas = document.getElementById('leastPopularProductsChart');
    if (!canvas) return; // Exit early if the canvas is not found
    const ctx = canvas.getContext('2d');

    // 💥 Destroy previous chart if it exists
    if (chartInstances[canvas]) {
        chartInstances[canvas].destroy();
    }

    const labels = Object.keys(productSales);
    const salesVolumes = Object.values(productSales);

    // Sort products by sales volume (ascending) and slice bottom 5
    const bottomProducts = labels
        .map((label, index) => ({
            label: label,
            salesVolume: salesVolumes[index]
        }))
        .sort((a, b) => a.salesVolume - b.salesVolume)
        .slice(0, 5);

    const bottomLabels = bottomProducts.map(product => product.label);
    const bottomSalesVolumes = bottomProducts.map(product => product.salesVolume);

    chartInstances[canvas] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bottomLabels,
            datasets: [{
                label: 'Quantity Sold',
                data: bottomSalesVolumes,
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxRotation: 90,
                        minRotation: 90
                    }
                }
            }
        }
    });
}

// #endregion }

// #region Exports All Charts {
const jsPDF = window.jspdf.jsPDF;
async function exportAllChartsAsPDF() {
    const chartIds = [
        'revenueChart',
        'profitChart',
        'quantityChart',
        'salesTrendChart',
        'profitMarginChart',
        'productAgeChart',
        'mostPopularProductsChart',
        'leastPopularProductsChart',
    ];

    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4"
    });

    let isFirstPage = true;

    for (const chartId of chartIds) {
        const canvas = document.getElementById(chartId);
        if (!canvas) continue;

        const imgData = canvas.toDataURL("image/png", 1.0);

        if (!isFirstPage) {
            pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", 60, 60, 700, 400);
        isFirstPage = false;
    }

    pdf.save("dashboard-charts.pdf");
}
async function generatePDFfromCanvas(canvasId, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element with ID "${canvasId}" not found.`);
        return null;
    }

    // Create new jsPDF instance
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png');

    // Optional: Add a title
    pdf.setFontSize(16);
    pdf.text(title, 10, 15);

    // Add image to PDF (fit inside A4)
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const aspectRatio = canvas.height / canvas.width;
    const pdfHeight = pdfWidth * aspectRatio;

    pdf.addImage(imgData, 'PNG', 10, 20, pdfWidth, pdfHeight);

    return pdf;
}
// #endregion }

// #region Inventory Summary {
async function fetchInventorySummary() {
    try {
        const snapshot = await db.collection("products").get();
        const allProducts = snapshot.docs.map(doc => doc.data());

        // Total Products
        const totalProducts = snapshot.size;
        document.querySelector("#total-products span").textContent = totalProducts;

        // Total Stock Units
        const totalStock = allProducts.reduce((sum, product) => sum + (product.stock || 0), 0);
        document.querySelector("#total-stock-units span").textContent = totalStock;

        // Out of Stock
        const outOfStockCount = allProducts.filter(product => (product.stock || 0) === 0).length;
        document.querySelector("#out-of-stock span").textContent = outOfStockCount;

        // Total Inventory Value
        const totalValue = allProducts.reduce((sum, product) => {
            return sum + ((product.stock || 0) * (product.costPrice || 0));
        }, 0);
        document.querySelector("#inventory-value span").textContent = `$${totalValue}`;

        // Low Stock (<= 5)
        const lowStockProducts = allProducts.filter(product => (product.stock || 0) <= 5);
        document.querySelector("#low-stock span").textContent = lowStockProducts.length;

        const list = document.querySelector("#low-stock-products");
        list.innerHTML = "";
        lowStockProducts.forEach(product => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = product.label;

            const stockCell = document.createElement("td");
            stockCell.textContent = product.stock;

            row.appendChild(nameCell);
            row.appendChild(stockCell);
            list.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching inventory analytics:", error);
    }
}
function getSmartInsights(salesData) {

    let totalRevenue = 0, totalProductsSold = 0, totalProfit = 0;
    let highestSalesDay = { date: '', revenue: 0 };
    let lowestSalesDay = { date: '', revenue: Infinity };
    let totalOrders = 0;

    salesData.forEach(sale => {

        totalRevenue += sale.totalRevenue || 0;
        totalProductsSold += sale.totalProductsSold || 0;
        totalProfit += sale.totalProfit || 0;
        totalOrders += sale.totalOrders || 0;

        if (sale.totalRevenue > highestSalesDay.revenue) {
            highestSalesDay = { date: sale.date, revenue: sale.totalRevenue };
        }
        if (sale.totalRevenue < lowestSalesDay.revenue) {
            lowestSalesDay = { date: sale.date, revenue: sale.totalRevenue };
        }
    });

    totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    totalOrders = salesData.length;

    const AOV = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    return {
        highestSalesDay,
        lowestSalesDay,
        AOV
    };
}
function renderSmartInsights(insights) {

    document.querySelector("#highest-sales-day").textContent = `${insights.highestSalesDay.date}, Revenue: $${insights.highestSalesDay.revenue}`;

    document.querySelector("#lowest-sales-day").textContent = `${insights.lowestSalesDay.date}, Revenue: $${insights.lowestSalesDay.revenue}`;

    document.querySelector("#average-order-value").textContent = `$${insights.AOV}`;
}
async function fetchSalesDataAndRenderInsights() {
    try {
        const snapshot = await db.collection("sales").get();
        const salesData = [];

        for (const doc of snapshot.docs) {
            const sale = doc.data();
            const productsSnapshot = await db.collection("sales").doc(doc.id).collection("productsSold").get();

            const productsSold = [];
            productsSnapshot.forEach(prodDoc => {
                productsSold.push(prodDoc.data());
            });

            salesData.push({
                ...sale,
                productsSold,
                date: doc.id
            });
        }

        const insights = getSmartInsights(salesData);
        renderSmartInsights(insights);

    } catch (error) {
        console.error("Error fetching sales data:", error);
    }
}
// #endregion }

// #endregion }


// #region 🟦 Sidebar Region [

// #region Profile Settings {
// TODO: enhance form validation and feedback.
const DEMO_USER_ID = "demo-user";
function getCurrentUserId() {
    return DEMO_USER_ID;
}
let initialBaseColor;
let currentComboColors = [];
let currentThemeIndex = 0;
const themeCombos = {
    default: ["#708090", "#97B8D8"],
    combo1: ["#808090", "#909090"],
    combo2: ["#102030", "#405060"],
    combo3: ["#302010", "#605040"]
};
function initProfile() {
    renderProfileForm();
    addEventListeners();
    loadUserProfile();
}
function renderProfileForm() {
    document.body.innerHTML = `
        <div class="container">
            <div class="header-container">
                <h5>Store Settings</h5>
                <button type="button" id="done-btn">Done</button>
            </div>
            <form class="product-form">
                <label>Store Name</label>
                <input type="text" id="storeName" placeholder="Enter your store name" />
                               
                <label>Exchange Rate (1$ = LBP)</label>
                <input type="text" id="exchangeRate" placeholder="LBP amount" />

                <label>Currency</label>
                <div id="currencyOptions" class="button-selector">
                    <button type="button" class="currency-btn" data-value="$">$</button>
                    <button type="button" class="currency-btn" data-value="LBP">LBP</button>
                </div>

                <label>Themes Combos</label>
                <div class="themes-combos" id="comboOptions">
                    <strong>Default:</strong>
                    <div class="combo-btn" data-value="default">
                        <div style="background-color: #708090;"></div>
                        <div style="background-color: #97B8D8;"></div>
                    </div>
                    <strong>Combo 1:</strong>
                    <div class="combo-btn" data-value="combo1">
                        <div style="background-color: #808090;"></div>
                        <div style="background-color: #909090;"></div>
                    </div>
                    <strong>Combo 2:</strong>
                    <div class="combo-btn" data-value="combo2">
                        <div style="background-color: #102030;"></div>
                        <div style="background-color: #405060;"></div>
                    </div>
                    <strong>Combo 3:</strong>
                    <div class="combo-btn" data-value="combo3">
                        <div style="background-color: #302010;"></div>
                        <div style="background-color: #605040;"></div>
                    </div>
                </div>

                <button type="submit" class="action-btn">Save Settings</button>
            </form>
        </div>
    `;
}
function addEventListeners() {
    document.getElementById("done-btn").addEventListener("click", () => {
        location.reload();
    });
    setupCurrencySelector();
    setupComboSelector();
    setupProfileFormSubmit();

    function setupCurrencySelector() {
        const buttons = document.querySelectorAll('.currency-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updateCurrencySelection(btn.dataset.value);
            });
        });
    }
    function setupComboSelector() {
        const combos = document.querySelectorAll('.combo-btn');
        combos.forEach(btn => {
            btn.addEventListener('click', () => {
                combos.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }
    function setupProfileFormSubmit() {

        const form = document.querySelector('.product-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const storeName = document.getElementById('storeName').value.trim();
            const exchangeRate = document.getElementById('exchangeRate').value.trim();
            const currency = getSelectedCurrency();
            const combo = getSelectedCombo();

            if (!storeName || !currency || !combo) return;

            const profileData = { storeName, exchangeRate, currency, combo, updatedAt: new Date() };
            await saveUserProfile(profileData);
        });

        function getSelectedCurrency() {
            const selectedBtn = document.querySelector('.currency-btn.selected');
            return selectedBtn ? selectedBtn.dataset.value : null;
        }

        function getSelectedCombo() {
            const selected = document.querySelector('.combo-btn.selected');
            return selected ? selected.dataset.value : null;
        }

        async function saveUserProfile(profileData) {
            const userId = getCurrentUserId();
            try {
                await db.collection('profile').doc(userId).set(profileData);
            } catch (error) {
                console.error("Failed to save profile settings:", error);
            }

            updateAccentColor(profileData.combo);
        }
    }
}
async function loadUserProfile() {
    const userId = getCurrentUserId();
    const profileRef = db.collection('profile').doc(userId);

    try {
        const doc = await profileRef.get();
        if (doc.exists) {
            const data = doc.data();
            applyUserProfileSettings(data);
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }

    function applyUserProfileSettings(data) {
        const storeNameInput = document.getElementById('storeName');
        if (storeNameInput) storeNameInput.value = data.storeName || '';

        const exchangeRateInput = document.getElementById('exchangeRate');
        if (exchangeRateInput) exchangeRateInput.value = data.exchangeRate || '';

        if (data.exchangeRate) {
            EXCHANGE_RATE = data.exchangeRate;
        }
        if (data.currency) {
            updateCurrencySelection(data.currency);
        } else {
            updateCurrencySelection("LBP");
        }
        updateComboSelection(data.combo);
        updateAccentColor(data.combo);
    }
}
function updateCurrencySelection(currency) {
    const buttons = document.querySelectorAll('.currency-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === currency) {
            btn.classList.add('selected');
        }
    });
    storeCurrency = currency;
    updateCurrencyView();
    const btn = document.getElementById("toggleCurrencyBtn");
    if (btn) {
        btn.textContent = storeCurrency === "$" ? "$" : "LBP";
        btn.addEventListener("click", () => {
            storeCurrency = storeCurrency === "$" ? "LBP" : "$";
            updateCurrencyView();
            updateToggleButtonText();
        });

        function updateToggleButtonText() {
            btn.textContent = storeCurrency === "$" ? "$" : "LBP";
        }
    }
}
function updateComboSelection(combo) {
    const comboBtns = document.querySelectorAll('.combo-btn');
    comboBtns.forEach(btn => {
        if (btn.dataset.value === combo) {
            btn.classList.add('selected');
        }
    });
}
function updateAccentColor(combo) {
    currentComboColors = themeCombos[combo] || themeCombos.default;
    initialBaseColor = currentComboColors[0];
    currentThemeIndex = 0;

    const root = document.documentElement;
    root.style.setProperty("--accent-color", currentComboColors[0]);
}

async function toggleTheme() {
    const root = document.documentElement;

    if (!currentComboColors.length) {
        const profileRef = db.collection('profile').doc(DEMO_USER_ID);
        const doc = await profileRef.get();
        if (!doc.exists) return;

        const data = doc.data();
        currentComboColors = themeCombos[data.combo] || themeCombos.default;
        initialBaseColor = currentComboColors[0];
        currentThemeIndex = 0;

        root.style.setProperty("--accent-color", initialBaseColor);
        return;
    }

    currentThemeIndex = currentThemeIndex === 0 ? 1 : 0;
    root.style.setProperty("--accent-color", currentComboColors[currentThemeIndex]);
}
// #endregion }

// #region PDF Layout {
async function initpdfLayout() {

    const userId = getCurrentUserId();

    const doc = await db.collection("pdfLayout").doc(userId).get();
    const settings = doc.exists ? doc.data() : {};

    const originalSettings = {
        fillColor: settings.fillColor || "#ffffff",
        titleTextColor: settings.titleTextColor || "#000000",
        titleFontSize: settings.titleFontSize || 16,
        titleAlign: settings.titleAlign || "left",
        headerColor: settings.headerColor || "#708090",
        headerTextColor: settings.headerTextColor || "#ffffff",
        evenRowColor: settings.evenRowColor || "#e6e6d2",
        evenRowTextColor: settings.evenRowTextColor || "#000000",
        oddRowColor: settings.oddRowColor || "#ffffff",
        oddRowTextColor: settings.oddRowTextColor || "#000000"
    };

    const factoryDefaults = {
        fillColor: "#ffffff",
        titleTextColor: "#000000",
        titleFontSize: 16,
        titleAlign: "left",
        headerColor: "#708090",
        headerTextColor: "#ffffff",
        evenRowColor: "#e6e6d2",
        evenRowTextColor: "#000000",
        oddRowColor: "#ffffff",
        oddRowTextColor: "#000000"
    };

    document.body.innerHTML = `
    <div id="pdf-layout-controls" class="container">
        <div class = "header-container">
            <h5>Change PDF Layout</h5>
            <button type="button" id="done-btn">done</button>
        </div>
        <form id="pdf-layout-form" class="produc-form">
            <label>Background Color:</label>
            <input type="color" id="fillColorPicker" value="${originalSettings.fillColor}" />
    
            <label>Title Text Color:</label>
            <input type="color" id="titleTextColor" value="${originalSettings.titleTextColor}" />
            <label>Title Font Size:</label>
            <input type="number" id="titleFontSizeInput" value="${originalSettings.titleFontSize}" min="8" max="30" />
            <label>Title Alignment:</label>
            <div id="titleAlignOptions" class="button-selector">
                <button type="button" class="align-btn" data-value="left">Left</button>
                <button type="button" class="align-btn" data-value="center">Center</button>
                <button type="button" class="align-btn" data-value="right">Right</button>
            </div>

            <label>Header Row Color:</label>
            <input type="color" id="headerColorPicker" value="${originalSettings.headerColor}" />
            <label>Header Text Color:</label>
            <input type="color" id="headerTextColor" value="${originalSettings.headerTextColor}" />
    
            <label>Even Row Color:</label>
            <input type="color" id="evenRowColorPicker" value="${originalSettings.evenRowColor}" />
            <label>Even Row Text Color:</label>
            <input type="color" id="evenRowTextColor" value="${originalSettings.evenRowTextColor}" />
    
            <label>Odd Row Color:</label>
            <input type="color" id="oddRowColorPicker" value="${originalSettings.oddRowColor}" />
            <label>Odd Row Text Color:</label>
            <input type="color" id="oddRowTextColor" value="${originalSettings.oddRowTextColor}" />
    
            <hr>
    
            <button type="submit" id="save-layout" class="action-btn">Save</button>
            <button id="reset-changes" type="button" class="action-btn">Reset Changes</button>
            <button id="reset-layout-default" type="button" class="action-btn" style="color: red;">Reset to Default</button>

        </form>
    </div>
    `;

    const buttons = document.querySelectorAll('.align-btn');
    let selectedValue = originalSettings.titleAlign;
    buttons.forEach(btn => {
        if (btn.dataset.value === selectedValue) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedValue = btn.dataset.value;
        });
    });


    const saveLayoutBtn = document.getElementById("save-layout");
    saveLayoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        saveLayout();
    });

    function applyInputValue(settingKey, value) {
        const map = {
            fillColor: "fillColorPicker",
            titleTextColor: "titleTextColor",
            titleFontSize: "titleFontSizeInput",
            headerColor: "headerColorPicker",
            headerTextColor: "headerTextColor",
            evenRowColor: "evenRowColorPicker",
            evenRowTextColor: "evenRowTextColor",
            oddRowColor: "oddRowColorPicker",
            oddRowTextColor: "oddRowTextColor"
        };

        if (settingKey === "titleAlign") {
            const buttons = document.querySelectorAll('.align-btn');
            buttons.forEach(b => b.classList.remove('selected'));
            const matchingButton = Array.from(buttons).find(b => b.dataset.value === value);
            if (matchingButton) matchingButton.classList.add('selected');
            return;
        }

        const elementId = map[settingKey];
        if (elementId) {
            const el = document.getElementById(elementId);
            if (el) el.value = value;
        }
    }

    document.getElementById("reset-changes").addEventListener("click", () => {
        Object.entries(originalSettings).forEach(([key, value]) => {
            applyInputValue(key, value);
        });
    });

    document.getElementById("reset-layout-default").addEventListener("click", () => {
        Object.entries(factoryDefaults).forEach(([key, value]) => {
            applyInputValue(key, value);
        });
    });

    const exitBtn = document.getElementById("done-btn");
    exitBtn.addEventListener("click", () => {
        location.reload();
    });
}
async function saveLayout() {
    const userId = "demo-user";

    // Background color
    const fillColor = document.getElementById("fillColorPicker").value;

    // Title
    const titleTextColor = document.getElementById("titleTextColor").value;
    const titleFontSize = document.getElementById("titleFontSizeInput").value;
    const selectedAlignButton = document.querySelector(".align-btn.selected");
    const titleAlign = selectedAlignButton ? selectedAlignButton.dataset.value : "left";

    // Header row
    const headerColor = document.getElementById("headerColorPicker").value;
    const headerTextColor = document.getElementById("headerTextColor").value;

    // Even row
    const evenRowColor = document.getElementById("evenRowColorPicker").value;
    const evenRowTextColor = document.getElementById("evenRowTextColor").value;

    // Odd row
    const oddRowColor = document.getElementById("oddRowColorPicker").value;
    const oddRowTextColor = document.getElementById("oddRowTextColor").value;

    const settings = {
        fillColor,
        titleTextColor,
        titleFontSize,
        titleAlign,
        headerColor,
        headerTextColor,
        evenRowColor,
        evenRowTextColor,
        oddRowColor,
        oddRowTextColor,
    };

    try {
        await db.collection("pdfLayout").doc(userId).set(settings);
        showModalMessage(`<p>Layout Changed Successfully.</p>`, true);
    } catch (err) {
        console.error("Error saving layout:", err);
    }
}
// #endregion }

// #region Feedback {
// TODO: add feedback collection with corresponding user and add a pic field for that.
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
// #endregion }

// #region Help {
function initHelp() {
    document.body.innerHTML = `
        <div class="help-section">
            <h1>Help Section for POS Application</h1>

            <h2>1. Getting Started</h2>
            <h3>Overview of the POS System</h3>
            <p>This is a brief overview of the POS system, explaining its purpose and features.</p>
            
            <h3>Installation/Setup Guide</h3>
            <ul>
                <li>Step 1: Download and install the application.</li>
                <li>Step 2: Open the app and create your first store.</li>
                <li>Step 3: Set up initial product categories and products.</li>
                <li>Step 4: Start processing sales and managing inventory.</li>
            </ul>

            <h2>2. Frequently Asked Questions (FAQs)</h2>
            <h3>How do I add products to the POS?</h3>
            <p>Instructions on adding products to the system.</p>

            <h3>How do I view my sales reports?</h3>
            <p>Instructions on how to access sales reports.</p>

            <h3>What should I do if a product is out of stock?</h3>
            <p>Steps to follow if a product is out of stock.</p>

            <h2>3. User Manual</h2>
            <h3>Dashboard Overview</h3>
            <p>Description of the dashboard's key features and layout.</p>

            <h3>Managing Products</h3>
            <p>Instructions on how to manage products in the system.</p>

            <h2>4. Troubleshooting</h2>
            <h3>Common Issues</h3>
            <p>Solutions to common problems users might face.</p>

            <h2>5. Contact Support</h2>
            <h3>Support Email</h3>
            <p>For assistance, contact our support team at: support@company.com.</p>
        </div>
    `;
}
// #endregion }

// #region Modal {
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
    okButton.style.padding = "10px 70px";
    okButton.style.backgroundColor = isSuccess ? "green" : "red";
    okButton.style.color = "#fff";
    okButton.style.border = "none";
    okButton.style.borderRadius = "5px";
    okButton.style.cursor = "pointer";
    okButton.style.fontSize = "20px";

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
// #endregion }

// #endregion ]


// #region 🟨 Exporting Region [
async function createStyledPDF(titleText) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const settings = await setPDFLayout(pdf, titleText);

    return { pdf, settings };
}
async function setPDFLayout(pdf, titleText) {
    const userId = "demo-user";
    const doc = await db.collection("pdfLayout").doc(userId).get();

    const settings = doc.exists ? doc.data() : {};

    // Background
    const bgRGB = hexToRgb(settings.fillColor || "#ffffff");
    pdf.setFillColor(bgRGB.r, bgRGB.g, bgRGB.b);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');

    // Title
    const titleTextColor = hexToRgb(settings.titleTextColor || "#000000");
    const titleFontSize = settings.titleFontSize || 16;
    const align = settings.titleAlign || "left";

    pdf.setFontSize(titleFontSize);
    pdf.setTextColor(titleTextColor.r, titleTextColor.g, titleTextColor.b);

    const pageWidth = pdf.internal.pageSize.getWidth();
    let x = 10;
    if (align === "center") x = pageWidth / 2;
    else if (align === "right") x = pageWidth - 10;

    pdf.text(titleText, x, 15, { align: align });

    return settings;
}
function getPDFTableStyles(settings) {
    const headerRGB = hexToRgb(settings.headerColor || "#708090");
    const headerTextRGB = hexToRgb(settings.headerTextColor || "#ffffff");
    const evenRGB = hexToRgb(settings.evenRowColor || "#e6e6d2");
    const evenTextRGB = hexToRgb(settings.evenRowTextColor || "#000000");
    const oddRGB = hexToRgb(settings.oddRowColor || "#ffffff");
    const oddTextRGB = hexToRgb(settings.oddRowTextColor || "#000000");

    return {
        theme: "grid",
        styles: {
            valign: "middle",
            halign: "center",
            fontSize: 10,
            lineWidth: 0.3,
            lineColor: [0, 0, 0],
        },
        headStyles: {
            fillColor: [headerRGB.r, headerRGB.g, headerRGB.b],
            textColor: [headerTextRGB.r, headerTextRGB.g, headerTextRGB.b],
            fontStyle: 'bold'
        },
        bodyStyles: {
            textColor: [oddTextRGB.r, oddTextRGB.g, oddTextRGB.b],
            fillColor: [oddRGB.r, oddRGB.g, oddRGB.b],
        },
        alternateRowStyles: {
            fillColor: [evenRGB.r, evenRGB.g, evenRGB.b],
            textColor: [evenTextRGB.r, evenTextRGB.g, evenTextRGB.b],
        }
    };
}
function hexToRgb(hex) {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return { r: 0, g: 0, b: 0 }; // Return black as default if invalid
    return {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16)
    };
}

async function exportToPDF(data) {
    try {
        const { pdf, settings } = await createStyledPDF("Products List");

        const columns = ["Label", "Barcode", "Cost Price ($)", "Profit ($)", "Category", "Stock", "Created At"];
        const rows = data.map(product => [
            product.label,
            product.barcode,
            product.costPrice,
            product.profit,
            product.category,
            product.stock,
            product.createdAt
        ]);

        pdf.autoTable({
            head: [columns],
            body: rows,
            startY: 20,
            ...getPDFTableStyles(settings)
        });

        pdf.save("product-list.pdf");
    } catch (err) {
        console.error("Error exporting PDF:", err);
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
                query = query.where("costPrice", "<=", 1);
            } else if (priceSelect === "medium-price") {
                query = query.where("costPrice", ">", 1).where("costPrice", "<=", 5);
            } else if (priceSelect === "high-price") {
                query = query.where("costPrice", ">", 5);
            }
        }

        if (stockSelect) {
            if (stockSelect === "low-stock") {
                query = query.where("stock", "<=", 5);
            } else if (stockSelect === "medium-stock") {
                query = query.where("stock", ">", 5).where("stock", "<=", 30);
            } else if (stockSelect === "high-stock") {
                query = query.where("stock", ">", 30);
            }
        }

        if (profitSelect) {
            if (profitSelect === "low-profit") {
                query = query.where("profit", "<=", 0.1);
            } else if (profitSelect === "medium-profit") {
                query = query.where("profit", ">", 0.1).where("profit", "<=", 1);
            } else if (profitSelect === "high-profit") {
                query = query.where("profit", ">", 1);
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
                costPrice: displayCurrency(data.costPrice),
                profit: displayCurrency(data.profit),
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
//TODO: continue from here.
async function fetchDebtDetailsForExport(customerId) {
    const snapshot = await db.collection("customers").doc(customerId).collection("debts").get();
    let total = 0;

    const debts = snapshot.docs.map(doc => {
        const data = doc.data();
        total += data.balance;
        return {
            details: data.details,
            balance: displayCurrency(data.balance),
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : "Unknown Date",
        };
    });
    total = displayCurrency(total);
    return { debts, total: total };
}
async function exportDebtDetailsToPDF(debtDetails, customerName, customerPhone, totalBalance) {
    try {
        const { pdf, settings } = await createStyledPDF("Customer Debt Details");
        const styles = getPDFTableStyles(settings);
        const headerColor = hexToRgb(settings.headerColor || "#708090");
        const headerTextColor = hexToRgb(settings.headerTextColor || "#ffffff");

        const columns = ["Details", "Balance ($)", "Created At"];
        const rows = debtDetails.map(debt => [
            debt.details,
            debt.balance,
            debt.createdAt
        ]);

        rows.push([
            {
                content: `Total Balance: $${totalBalance}`,
                colSpan: 3,
                styles: {
                    halign: 'center',
                    fontStyle: 'bold',
                    fillColor: [headerColor.r, headerColor.g, headerColor.b],
                    textColor: [headerTextColor.r, headerTextColor.g, headerTextColor.b]
                }
            }
        ]);

        pdf.autoTable({
            head: [["Field", "Value"]],
            body: [
                ["Customer Name:", customerName],
                ["Phone Number:", customerPhone]
            ],
            startY: 30,
            columnStyles: {
                0: { cellWidth: 35, halign: 'left', fontStyle: 'bold' },
                1: { cellWidth: 55, halign: 'left' }
            },
            ...styles
        });



        pdf.autoTable({
            head: [columns],
            body: rows,
            startY: pdf.lastAutoTable.finalY + 10,
            ...styles
        });

        pdf.save(`${customerName.replace(/[^a-z0-9]/gi, '_')}_debt_details.pdf`);
    } catch (err) {
        console.error("Error exporting debt details PDF:", err);
    }
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

    const cartProductsSnapshot = await cartDocRef.collection("cartProducts").get();

    const cartProducts = cartProductsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.name,
            quantity: data.quantity,
            costPrice: data.costPrice,
            total: data.total
        };
    });

    const { pdf, settings } = await createStyledPDF("Customer Debt Details");
    const styles = getPDFTableStyles(settings);

    const cartDetailsHead = [["Field", "Value"]];
    const cartDetailsBody = [
        ["Cart Name:", cartData.name],
        ["Date Created:", cartData.dateCreated.toDate().toLocaleString()],
        ["Total Cost:", `$${cartData.totalCost}`]
    ];

    pdf.autoTable({
        head: cartDetailsHead,
        body: cartDetailsBody,
        startY: 20,
        ...styles,
        columnStyles: {
            0: { cellWidth: 35, halign: 'left', fontStyle: 'bold' },
            1: { cellWidth: 55, halign: 'left' }
        }
    });

    const finalY = pdf.lastAutoTable.finalY + 10;
    const columns = ["Product Name", "Quantity", "Cost Price ($)", "Total ($)"];
    const rows = cartProducts.map(product => [
        product.name,
        product.quantity,
        product.costPrice,
        product.total
    ]);

    pdf.autoTable({
        head: [columns],
        body: rows,
        startY: finalY,
        ...styles,
    });

    pdf.save(`${cartData.name}_export.pdf`);
}

async function exportSalesTableToPDF(event) {
    try {

        const button = event.target;

        const table = button.closest(".table-actions").previousElementSibling;
        const salesHeader = table.previousElementSibling;

        if (!table || !salesHeader) {
            console.error("Table or header not found.");
            return;
        }

        const salesDate = salesHeader.textContent.replace("Sales on ", "").trim();

        const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText);

        const bodyRows = Array.from(table.querySelectorAll("tbody tr")).map(row =>
            Array.from(row.querySelectorAll("td")).map(td => td.innerText)
        );

        const { pdf, settings } = await createStyledPDF(`sales on ${salesDate}`);
        const styles = getPDFTableStyles(settings);
        const headerColor = hexToRgb(settings.headerColor || "#708090");
        const headerTextColor = hexToRgb(settings.headerTextColor || "#ffffff");

        const footerRow = table.querySelector("tfoot tr");
        const footerCells = Array.from(footerRow.querySelectorAll("td")).map((td, index) => {
            if (index === 0) {
                return {
                    content: td.innerText,
                    colSpan: 3,
                    styles: {
                        fontStyle: 'bold',
                        fillColor: [headerColor.r, headerColor.g, headerColor.b],
                        textColor: [headerTextColor.r, headerTextColor.g, headerTextColor.b]
                    }
                };
            } else {
                return {
                    content: td.innerText,
                    styles: {
                        fontStyle: 'bold',
                        fillColor: [headerColor.r, headerColor.g, headerColor.b],
                        textColor: [headerTextColor.r, headerTextColor.g, headerTextColor.b]
                    }
                };
            }
        });

        const rowsWithFooter = [...bodyRows, footerCells];

        pdf.autoTable({
            head: [headers],
            body: rowsWithFooter,
            startY: 20,
            ...styles
        });

        pdf.save(`sales-report-${salesDate}.pdf`);
    } catch (error) {
        console.error("Error exporting sales table:", error);
    }
}
// #endregion ]


// #region 👀 Other [
let EXCHANGE_RATE = 90000;
function displayCurrency(amount) {
    if (storeCurrency === "$") {
        return amount.toFixed(2) + '$';
    } else if (storeCurrency === "LBP") {
        const convertAmount = convertCurrency(amount, "$", "LBP");
        return `${formatCompactNumber(convertAmount)} LBP`;
    }
}

function convertCurrency(amount, from = "LBP", to = "$") {
    if (from === "LBP" && to === "$") {
        return amount / EXCHANGE_RATE;
    } else if (from === "$" && to === "LBP") {
        return amount * EXCHANGE_RATE;
    }
    return amount;
}

function formatCompactNumber(num) {
    return new Intl.NumberFormat('en', {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1
    }).format(num);
}

let currentPageCurrencyUpdate = null;
function setCurrencyUpdateCallback(callback) {
    currentPageCurrencyUpdate = callback;
}

function updateCurrencyView() {
    if (typeof currentPageCurrencyUpdate === "function") {
        currentPageCurrencyUpdate();
    }
}
// #endregion ]

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    initializeEventListeners();
    showLoadingOverlay(1500);
});

// TODO: add confirmation and dont ask again to some actions.