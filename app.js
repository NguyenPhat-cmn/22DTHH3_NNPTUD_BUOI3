const API_URL = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];

let currentPage = 1;
let pageSize = 10;
let sortField = "";
let sortAsc = true;

let base64Image = "";


// LOAD DATA
async function loadData() {
    const res = await fetch(API_URL);
    products = await res.json();
    filtered = [...products];
    render();
}

loadData();


// SEARCH
document.getElementById("searchInput").addEventListener("input", e => {

    const key = e.target.value.toLowerCase();

    filtered = products.filter(p =>
        p.title.toLowerCase().includes(key)
    );

    currentPage = 1;
    render();
});


// PAGE SIZE
document.getElementById("pageSize").addEventListener("change", e => {
    pageSize = Number(e.target.value);
    currentPage = 1;
    render();
});


// SORT
function sortBy(field) {

    sortAsc = sortField === field ? !sortAsc : true;
    sortField = field;

    filtered.sort((a, b) => {

        if (a[field] > b[field]) return sortAsc ? 1 : -1;
        if (a[field] < b[field]) return sortAsc ? -1 : 1;
        return 0;

    });

    render();
}


// RENDER TABLE
function render() {

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    const viewData = filtered.slice(start, end);

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    viewData.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.id}</td>
            <td title="${item.description}">
                ${item.title}
            </td>
            <td>${item.price}</td>
            <td>${item.category?.name}</td>
            <td>
                <img src="${item.images[0]}" class="thumb">
            </td>
        `;

        tr.onclick = () => openDetail(item);

        tbody.appendChild(tr);

    });

    renderPagination();
}


// PAGINATION
function renderPagination() {

    const totalPage = Math.ceil(filtered.length / pageSize);
    const ul = document.getElementById("pagination");

    ul.innerHTML = "";

    for (let i = 1; i <= totalPage; i++) {

        const li = document.createElement("li");

        li.className = "page-item " + (i === currentPage ? "active" : "");

        li.innerHTML = `<a class="page-link">${i}</a>`;

        li.onclick = () => {
            currentPage = i;
            render();
        };

        ul.appendChild(li);
    }
}


// EXPORT CSV
function exportCSV() {

    let csv = "ID,Title,Price,Category\n";

    const start = (currentPage - 1) * pageSize;
    const view = filtered.slice(start, start + pageSize);

    view.forEach(p => {
        csv += `${p.id},"${p.title}",${p.price},"${p.category?.name}"\n`;
    });

    const blob = new Blob([csv]);
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "products.csv";
    link.click();
}


// DETAIL MODAL
const detailModal = new bootstrap.Modal(
    document.getElementById("detailModal")
);

function openDetail(item) {

    editId.value = item.id;
    editTitle.value = item.title;
    editPrice.value = item.price;
    editDescription.value = item.description;

    detailModal.show();
}


// UPDATE PRODUCT
async function updateProduct() {

    const id = editId.value;

    const body = {
        title: editTitle.value,
        price: Number(editPrice.value),
        description: editDescription.value
    };

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    alert("Updated successfully");

    detailModal.hide();
    loadData();
}


// CREATE MODAL
const createModal = new bootstrap.Modal(
    document.getElementById("createModal")
);

function openCreateModal() {
    createModal.show();
}


// IMAGE PREVIEW
document.getElementById("newImage").addEventListener("change", function() {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        base64Image = e.target.result;

        previewImg.src = base64Image;
        previewImg.style.display = "block";
    };

    reader.readAsDataURL(file);
});


// CREATE PRODUCT
async function createProduct() {

    const body = {
        title: newTitle.value,
        price: Number(newPrice.value),
        description: newDesc.value,
        categoryId: 1,
        images: [
            base64Image || "https://placeimg.com/640/480/any"
        ]
    };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    alert("Created successfully");

    // reset
    base64Image = "";
    previewImg.style.display = "none";

    createModal.hide();
    loadData();
}