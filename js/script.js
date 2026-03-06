// ===============================
// LOGIN
// ===============================

function login() {

    alert("Login successful");

    window.location.href = "dashboard.html";

}


// ===============================
// ADD PRODUCT
// ===============================

function addProduct() {

    let name = document.querySelector('input[placeholder="Product Name"]').value;
    let price = document.querySelector('input[placeholder="Price"]').value;
    let seller = document.querySelector('input[placeholder="Seller Name"]').value;
    let category = document.querySelector('input[placeholder="Category (Laptop, Book, etc)"]').value;
    let description = document.querySelector("textarea").value;
    let imageInput = document.getElementById("productImage");

    if (name === "" || price === "" || seller === "") {
        alert("Please fill all required fields");
        return;
    }

    let reader = new FileReader();

    reader.onload = function () {

        let product = {
            name: name,
            price: price,
            seller: seller,
            category: category,
            description: description,
            image: reader.result,
            likes: 0
        };

        saveProduct(product);
    };

    if (imageInput.files.length > 0) {

        reader.readAsDataURL(imageInput.files[0]);

    } else {

        let product = {
            name: name,
            price: price,
            seller: seller,
            category: category,
            description: description,
            image: "",
            likes: 0
        };

        saveProduct(product);
    }

}


// ===============================
// SAVE PRODUCT
// ===============================

function saveProduct(product) {

    let products = JSON.parse(localStorage.getItem("products")) || [];

    products.push(product);

    localStorage.setItem("products", JSON.stringify(products));

    alert("Product Added!");

    window.location.href = "dashboard.html";

}


// ===============================
// DISPLAY PRODUCTS
// ===============================

function displayProducts() {

    let container = document.querySelector(".products");

    if (!container) return;

    let products = JSON.parse(localStorage.getItem("products")) || [];

    container.innerHTML = "";

    products.forEach((product, index) => {

        container.innerHTML += `
        <div class="card">

            ${product.image ? `<img src="${product.image}" width="100%">` : ""}

            <h3>${product.name}</h3>

            <p>💰 Price: ₵${Number(product.price).toLocaleString()}</p>

            <p>👤 Seller: ${product.seller}</p>

            <p>📂 Category: ${product.category}</p>

            <p>${product.description}</p>

            <button onclick="likeProduct(${index})">
                ❤️ ${product.likes}
            </button>

            <button onclick="deleteProduct(${index})">
                Delete
            </button>

        </div>
        `;
    });

}


// ===============================
// LIKE PRODUCT
// ===============================

function likeProduct(index) {

    let products = JSON.parse(localStorage.getItem("products")) || [];

    products[index].likes += 1;

    localStorage.setItem("products", JSON.stringify(products));

    displayProducts();

}


// ===============================
// DELETE PRODUCT
// ===============================

function deleteProduct(index) {

    let products = JSON.parse(localStorage.getItem("products")) || [];

    if (confirm("Are you sure you want to delete this product?")) {

        products.splice(index, 1);

        localStorage.setItem("products", JSON.stringify(products));

        displayProducts();
    }

}


// ===============================
// SEARCH PRODUCTS
// ===============================

function searchProducts(keyword) {

    let products = JSON.parse(localStorage.getItem("products")) || [];

    let container = document.querySelector(".products");

    if (!container) return;

    let filtered = products.filter(product =>
        product.name.toLowerCase().includes(keyword.toLowerCase())
    );

    container.innerHTML = "";

    filtered.forEach(product => {

        container.innerHTML += `
        <div class="card">
            <h3>${product.name}</h3>
            <p>💰 ₵${Number(product.price).toLocaleString()}</p>
        </div>
        `;
    });

}


// ===============================
// PAGE LOAD
// ===============================

window.onload = function () {

    displayProducts();

};// ===============================
// ADD PRODUCT
// ===============================

function addProduct() {

let name = document.getElementById("productName").value;
let price = document.getElementById("productPrice").value;
let seller = document.getElementById("productSeller").value;
let category = document.getElementById("productCategory").value;
let description = document.getElementById("productDescription").value;
let imageInput = document.getElementById("productImage");

if(name === "" || price === ""){
alert("Product Name and Price are required!");
return;
}

let reader = new FileReader();

reader.onload = function(){

let products = JSON.parse(localStorage.getItem("products")) || [];

let product = {
name,
price,
seller,
category,
description,
image: reader.result
};

products.push(product);

localStorage.setItem("products", JSON.stringify(products));

alert("Product Added ✅");

window.location.href = "dashboard.html";

};

if(imageInput.files[0]){
reader.readAsDataURL(imageInput.files[0]);
} else {
reader.onload();
}

}



// ===============================
// LOAD PRODUCTS
// ===============================

function loadProducts(){

let grid = document.getElementById("productGrid");

if(!grid) return;

let products = JSON.parse(localStorage.getItem("products")) || [];

grid.innerHTML = "";

products.forEach((product,index)=>{

grid.innerHTML += `

<div class="product-card">

<div class="card-image">
<img src="${product.image}" width="100%">
</div>

<div class="card-body">

<div class="card-category">
${product.category}
</div>

<h4 class="card-title">
${product.name}
</h4>

<div class="card-price">
₵ ${product.price}
</div>

<p class="card-info">
${product.description}
</p>

<p>
👤 ${product.seller}
</p>

<div class="card-actions">

<button onclick="deleteProduct(${index})"
class="btn btn-delete">
Delete
</button>

</div>

</div>
</div>

`;

});

}



// ===============================
// DELETE PRODUCT
// ===============================

function deleteProduct(index){

let products = JSON.parse(localStorage.getItem("products")) || [];

products.splice(index,1);

localStorage.setItem("products", JSON.stringify(products));

loadProducts();

}



// ===============================
// LOGOUT
// ===============================

function logout(){

localStorage.removeItem("username");

window.location.href = "login.html";

}



// ===============================
// AUTO LOAD PRODUCTS
// ===============================

window.onload = function(){

loadProducts();

};