// ============================================================
// PRODUTOS PADRÃO (usados somente na primeira execução)
// ============================================================
const defaultProducts = [
    { name: "Whisky 21 anos", price: 0.85 },
    { name: "Vodka", price: 1.25 },
    { name: "Refeição Cowboy", price: 2.39 },
    { name: "Frango Caipira", price: 1.47 },
    { name: "Batata Recheada", price: 1.35 },
    { name: "Torta de fruta (qualquer)", price: 0.75 },
    { name: "Sucos (Todos)", price: 0.65 },
    { name: "Salada de Fruta", price: 0.89 },
    { name: "Pão com manteiga", price: 0.69 },
    { name: "Café com Leite", price: 1.10 },
    { name: "Bolo com Pimenta", price: 0.69 },
    { name: "Chocolate Amargo", price: 0.89 },
    { name: "Ramunê do Hiro", price: 3.99 },
    { name: "Sukita", price: 3.99 },
    { name: "Coca-Bola", price: 3.99 },
    { name: "Whey Protein", price: 3.99 },
    { name: "Coxinha de frango", price: 4.85 },
    { name: "Lasanha", price: 4.85 },
    { name: "Licor de Café", price: 0.85 },
    { name: "Brigadeiro", price: 1.50 },
    { name: "Açai", price: 1.85 },
    { name: "Cerveja de Trigo", price: 0.85 },
    { name: "Achocolatado Quentinho", price: 0.85 },
    { name: "Big Meki do Montanha", price: 4.85 },
    { name: "Pote de Mel", price: 0.50 },
    { name: "Chocolate Quente", price: 0.85 }
];

// ============================================================
// LOCALSTORAGE: GARANTE QUE SÓ CARREGA OS PADRÃO UMA VEZ
// ============================================================
if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(defaultProducts));
}

// Carrega os produtos salvos
let products = JSON.parse(localStorage.getItem("products") || "[]");


// ============================================================
// DISTRITOS
// ============================================================
const districts = {
    "West Elizabeth": 0,
    "New Hanover": 2,
    "Lemoyne": 4.00,
    "Ambarino": 8.00,
    "New Austin": 20.00,
    "México": 20.00,
    "Guarma": 20.00
};

// ============================================================
// ESTADOS
// ============================================================
let cart = [];
let orders = JSON.parse(localStorage.getItem("orders") || "[]");
let orderCounter = Number(localStorage.getItem("orderCounter") || 1);

// ============================================================
// ELEMENTOS
// ============================================================
const productSelect = document.getElementById("product");
const districtSelect = document.getElementById("district");
const qtyInput = document.getElementById("qty");
const unitPriceDiv = document.getElementById("unitPrice");
const selectedName = document.getElementById("selectedName");
const selectedDetails = document.getElementById("selectedDetails");
const selectedSubtotal = document.getElementById("selectedSubtotal");
const cartBody = document.getElementById("cartBody");
const subtotalValue = document.getElementById("subtotalValue");
const totalValue = document.getElementById("totalValue");
const ordersList = document.getElementById("ordersList");


// ============================================================
// FUNÇÃO PARA ORDENAR PRODUTOS
// ============================================================
function sortProducts() {
    products.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}


// ============================================================
// CARREGAR PRODUTOS (AGORA EM ORDEM ALFABÉTICA SEMPRE)
// ============================================================
function loadProducts() {
    sortProducts();

    productSelect.innerHTML = "";
    products.forEach((p, i) => {
        productSelect.innerHTML += `<option value="${i}">${p.name}</option>`;
    });

    updateItemSummary();
}

loadProducts();


// ============================================================
// CARREGAR DISTRITOS
// ============================================================
function loadDistricts() {
    districtSelect.innerHTML = "";
    Object.keys(districts).forEach(d => {
        districtSelect.innerHTML += `<option value="${d}">${d}</option>`;
    });
}
loadDistricts();


// ============================================================
// ATUALIZAR RESUMO DO ITEM
// ============================================================
function updateItemSummary() {
    const p = products[productSelect.value];
    if (!p) return;

    const qty = Number(qtyInput.value) || 1;
    const dist = districtSelect.value;

    unitPriceDiv.textContent = `$ ${p.price.toFixed(2)}`;

    selectedName.textContent = p.name;
    selectedDetails.textContent = `${qty}x • ${dist}`;
    selectedSubtotal.textContent = `$ ${(p.price * qty).toFixed(2)}`;
}

productSelect.onchange =
districtSelect.onchange =
qtyInput.oninput = updateItemSummary;


// ============================================================
// ADICIONAR AO CARRINHO
// ============================================================
document.getElementById("addBtn").onclick = () => {
    const p = products[productSelect.value];
    const qty = Number(qtyInput.value) || 1;
    const dist = districtSelect.value;

    cart.push({
        name: p.name,
        qty,
        district: dist,
        price: p.price * qty
    });

    renderCart();
};


// ============================================================
// RENDERIZAR CARRINHO
// ============================================================
function renderCart() {
    if (cart.length === 0) {
        cartBody.innerHTML = `<tr><td colspan="5" class="muted small">Carrinho Vazio</td></tr>`;
        subtotalValue.textContent = "$ 0.00";
        totalValue.textContent = "$ 0.00";
        return;
    }

    cartBody.innerHTML = "";
    cart.forEach((item, index) => {
        cartBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.district}</td>
                <td>$ ${item.price.toFixed(2)}</td>
                <td><button class="ghost" onclick="removeItem(${index})">X</button></td>
            </tr>
        `;
    });

    const subtotal = cart.reduce((a, b) => a + b.price, 0);
    subtotalValue.textContent = `$ ${subtotal.toFixed(2)}`;

    const districtsInCart = [...new Set(cart.map(i => i.district))];
    let freightTotal = 0;
    districtsInCart.forEach(d => freightTotal += (districts[d] || 0));

    totalValue.textContent = `$ ${(subtotal + freightTotal).toFixed(2)}`;
}

function removeItem(i) {
    cart.splice(i, 1);
    renderCart();
}

document.getElementById("clearBtn").onclick = () => {
    cart = [];
    renderCart();
};


// ============================================================
// FINALIZAR PEDIDO
// ============================================================
document.getElementById("finishOrderBtn").onclick = () => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((a, b) => a + b.price, 0);
    const districtsInCart = [...new Set(cart.map(i => i.district))];

    let freightTotal = 0;
    districtsInCart.forEach(d => freightTotal += districts[d] || 0);

    const total = subtotal + freightTotal;

    const order = {
        id: orderCounter,
        district: districtsInCart.join(", "),
        items: [...cart],
        subtotal,
        total
    };

    orders.push(order);
    orderCounter++;

    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("orderCounter", orderCounter);

    cart = [];
    renderCart();
    renderOrders();
};


// ============================================================
// RENDERIZAR PEDIDOS
// ============================================================
function renderOrders() {
    if (orders.length === 0) {
        ordersList.innerHTML = `<div class="muted small">Nenhum pedido encontrado.</div>`;
        return;
    }

    ordersList.innerHTML = "";

    orders.forEach(o => {
        let itemsHTML = "";
        o.items.forEach(i => {
            itemsHTML += `
                <div class="order-item">
                    <span>${i.qty}x ${i.name}</span>
                    <span>$ ${i.price.toFixed(2)}</span>
                </div>
            `;
        });

        ordersList.innerHTML += `
            <div class="order-card" id="order-${o.id}">
                <div class="order-header">
                    <div class="order-title">Pedido #${String(o.id).padStart(4, "0")} – ${o.district}</div>
                    <button class="ghost" onclick="finishOrder(${o.id})">Concluir</button>
                </div>

                <div class="order-items">${itemsHTML}</div>

                <div class="order-totals">
                    <div>Subtotal: <strong>$ ${o.subtotal.toFixed(2)}</strong></div>
                    <div>Total + Frete: <strong>$ ${o.total.toFixed(2)}</strong></div>
                </div>
            </div>
        `;
    });
}

function finishOrder(id) {
    orders = orders.filter(o => o.id !== id);
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();
}

renderOrders();


// ============================================================
// CADASTRAR NOVO PRODUTO (COM LOCALSTORAGE + ORDEM ALFABÉTICA)
// ============================================================
document.getElementById("registerProductBtn").onclick = () => {
    const name = document.getElementById("newProductName").value.trim();
    const price = Number(document.getElementById("newProductPrice").value);

    if (!name || price <= 0) {
        document.getElementById("registerMessage").textContent = "Preencha nome e preço válidos.";
        return;
    }

    products.push({ name, price });

    // atualizar localStorage
    localStorage.setItem("products", JSON.stringify(products));

    // recarregar lista com organização alfabética
    loadProducts();

    document.getElementById("registerMessage").textContent = "Produto cadastrado!";
    document.getElementById("newProductName").value = "";
    document.getElementById("newProductPrice").value = "";
};
