/* =====================================================
   ALFANGARY ADMIN
===================================================== */

const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const productsTable =
    document.getElementById("productsTable");

const servicesTable =
    document.getElementById("servicesTable");

const productsCount =
    document.getElementById("productsCount");

const servicesCount =
    document.getElementById("servicesCount");

const productsTotal =
    document.getElementById("productsTotal");

const servicesTotal =
    document.getElementById("servicesTotal");


/* =====================================================
   CHECK LOGIN
===================================================== */

async function checkLogin() {

    try {

        const response =
            await fetch("/api/me");

        const data =
            await response.json();

        if (data.admin) {

            showAdmin();

        } else {

            showLogin();

        }

    } catch (error) {

        showLogin();

    }

}


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    loginScreen.classList.remove("hidden");

    adminApp.classList.add("hidden");

}


/* =====================================================
   SHOW ADMIN
===================================================== */

function showAdmin() {

    loginScreen.classList.add("hidden");

    adminApp.classList.remove("hidden");

    loadProducts();

    loadServices();

}


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginError.textContent = "";

        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;


        try {

            const response =
                await fetch(
                    "/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username,
                            password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                loginError.textContent =
                    data.error ||
                    "بيانات الدخول غير صحيحة";

                return;

            }


            showAdmin();


        } catch (error) {

            loginError.textContent =
                "تعذر الاتصال بالسيرفر";

        }

    }
);


/* =====================================================
   LOGOUT
===================================================== */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async function () {

            await fetch(
                "/api/logout",
                {
                    method: "POST"
                }
            );

            location.reload();

        }
    );


/* =====================================================
   NAVIGATION
===================================================== */

const navItems =
    document.querySelectorAll(".nav-item");

const sections = {

    dashboard:
        document.getElementById(
            "dashboardSection"
        ),

    products:
        document.getElementById(
            "productsSection"
        ),

    services:
        document.getElementById(
            "servicesSection"
        )

};


const pageTitle =
    document.getElementById("pageTitle");


navItems.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                navItems.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                button.classList.add("active");


                Object.values(sections)
                    .forEach(
                        section =>
                            section.classList.remove(
                                "active-section"
                            )
                    );


                const section =
                    button.dataset.section;


                sections[section]
                    .classList.add(
                        "active-section"
                    );


                const titles = {

                    dashboard:
                        "لوحة التحكم",

                    products:
                        "إدارة المنتجات",

                    services:
                        "إدارة الخدمات"

                };


                pageTitle.textContent =
                    titles[section];

            }
        );

    }
);


/* =====================================================
   MODAL SYSTEM
===================================================== */

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {

        modal.classList.add("active");

        document.body.style.overflow =
            "hidden";

    }

}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {

        modal.classList.remove("active");

        document.body.style.overflow =
            "";

    }

}


document
    .querySelectorAll("[data-close]")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    closeModal(
                        button.dataset.close
                    );

                }
            );

        }
    );


document
    .querySelectorAll(".modal")
    .forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        closeModal(
                            modal.id
                        );

                    }

                }
            );

        }
    );


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            document
                .querySelectorAll(
                    ".modal.active"
                )
                .forEach(
                    modal =>
                        closeModal(
                            modal.id
                        )
                );

        }

    }
);


/* =====================================================
   OPEN PRODUCT MODAL
===================================================== */

document
    .getElementById("openProductModal")
    .addEventListener(
        "click",
        function () {

            openModal(
                "productModal"
            );

        }
    );


document
    .getElementById(
        "openProductFromDashboard"
    )
    .addEventListener(
        "click",
        function () {

            openModal(
                "productModal"
            );

        }
    );


/* =====================================================
   OPEN SERVICE MODAL
===================================================== */

document
    .getElementById("openServiceModal")
    .addEventListener(
        "click",
        function () {

            openModal(
                "serviceModal"
            );

        }
    );


document
    .getElementById(
        "openServiceFromDashboard"
    )
    .addEventListener(
        "click",
        function () {

            openModal(
                "serviceModal"
            );

        }
    );


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const response =
            await fetch(
                "/api/products"
            );


        if (response.status === 401) {

            showLogin();

            return;

        }


        const products =
            await response.json();


        productsCount.textContent =
            products.length;

        productsTotal.textContent =
            `${products.length} منتج`;


        if (!products.length) {

            productsTable.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="admin-empty">
                            لا توجد منتجات حتى الآن
                        </div>
                    </td>
                </tr>
            `;

            return;

        }


        productsTable.innerHTML =
            products
                .map(
                    product =>
                        productRow(product)
                )
                .join("");


    } catch (error) {

        productsTable.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="admin-empty">
                        حدث خطأ أثناء تحميل المنتجات
                    </div>
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   PRODUCT ROW
===================================================== */

function productRow(product) {

    const image =
        product.image
            ? `
                <img
                    src="${escapeHtml(
                        product.image
                    )}"
                    alt=""
                >
              `
            : `
                <div class="no-image">
                    AF
                </div>
              `;


    const available =
        product.available
            ? `
                <span class="badge">
                    متاح
                </span>
              `
            : `
                <span class="badge off">
                    غير متاح
                </span>
              `;


    return `

        <tr>

            <td>

                <div class="table-product">

                    ${image}

                    <div>

                        <strong>
                            ${escapeHtml(
                                product.name
                            )}
                        </strong>

                        <small>
                            ID: ${product.id}
                        </small>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHtml(
                    product.brand || "-"
                )}
            </td>


            <td>
                ${escapeHtml(
                    product.model || "-"
                )}
            </td>


            <td>
                ${escapeHtml(
                    product.year || "-"
                )}
            </td>


            <td>
                ${escapeHtml(
                    product.side || "-"
                )}
            </td>


            <td>

                <span class="price">

                    ${escapeHtml(
                        product.price || "-"
                    )}

                </span>

            </td>


            <td>
                ${available}
            </td>


            <td>

                <button
                    class="delete-button"
                    onclick="deleteProduct(${product.id})"
                >
                    حذف
                </button>

            </td>

        </tr>

    `;

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذا المنتج؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/products/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "حدث خطأ"
            );

            return;

        }


        await loadProducts();

    } catch (error) {

        alert(
            "تعذر الاتصال بالسيرفر"
        );

    }

}


/* =====================================================
   PRODUCT FORM
===================================================== */

document
    .getElementById("productForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const form =
                event.target;

            const message =
                document.getElementById(
                    "productFormMessage"
                );


            message.textContent =
                "جاري إضافة المنتج...";


            const formData =
                new FormData(form);


            if (
                !formData.get("available")
            ) {

                formData.set(
                    "available",
                    "0"
                );

            } else {

                formData.set(
                    "available",
                    "1"
                );

            }


            try {

                const response =
                    await fetch(
                        "/api/products",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.error ||
                        "حدث خطأ";

                    return;

                }


                message.textContent =
                    "تمت إضافة المنتج بنجاح";


                form.reset();


                form.querySelector(
                    '[name="available"]'
                ).checked = true;


                await loadProducts();


                setTimeout(
                    function () {

                        closeModal(
                            "productModal"
                        );

                        message.textContent =
                            "";

                    },
                    700
                );


            } catch (error) {

                message.textContent =
                    "تعذر الاتصال بالسيرفر";

            }

        }
    );


/* =====================================================
   LOAD SERVICES
===================================================== */

async function loadServices() {

    try {

        const response =
            await fetch(
                "/api/services"
            );


        const services =
            await response.json();


        servicesCount.textContent =
            services.length;

        servicesTotal.textContent =
            `${services.length} خدمة`;


        if (!services.length) {

            servicesTable.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="admin-empty">
                            لا توجد خدمات حتى الآن
                        </div>
                    </td>
                </tr>
            `;

            return;

        }


        servicesTable.innerHTML =
            services
                .map(
                    service =>
                        serviceRow(service)
                )
                .join("");


    } catch (error) {

        servicesTable.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="admin-empty">
                        حدث خطأ أثناء تحميل الخدمات
                    </div>
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   SERVICE ROW
===================================================== */

function serviceRow(service) {

    const image =
        service.image
            ? `
                <img
                    src="${escapeHtml(
                        service.image
                    )}"
                    alt=""
                >
              `
            : `
                <div class="no-image">
                    AF
                </div>
              `;


    return `

        <tr>

            <td>

                <div class="table-product">

                    ${image}

                    <div>

                        <strong>
                            ${escapeHtml(
                                service.name
                            )}
                        </strong>

                        <small>
                            ID: ${service.id}
                        </small>

                    </div>

                </div>

            </td>


            <td>

                ${escapeHtml(
                    service.description || "-"
                )}

            </td>


            <td>

                <span class="price">

                    ${escapeHtml(
                        service.price || "-"
                    )}

                </span>

            </td>


            <td>

                ${
                    service.image
                        ? `<span class="badge">موجودة</span>`
                        : `<span class="badge off">بدون صورة</span>`
                }

            </td>


            <td>

                <button
                    class="delete-button"
                    onclick="deleteService(${service.id})"
                >
                    حذف
                </button>

            </td>

        </tr>

    `;

}


/* =====================================================
   DELETE SERVICE
===================================================== */

async function deleteService(id) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذه الخدمة؟"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/services/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "حدث خطأ"
            );

            return;

        }


        await loadServices();

    } catch (error) {

        alert(
            "تعذر الاتصال بالسيرفر"
        );

    }

}


/* =====================================================
   SERVICE FORM
===================================================== */

document
    .getElementById("serviceForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const form =
                event.target;

            const message =
                document.getElementById(
                    "serviceFormMessage"
                );


            message.textContent =
                "جاري إضافة الخدمة...";


            const formData =
                new FormData(form);


            try {

                const response =
                    await fetch(
                        "/api/services",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.error ||
                        "حدث خطأ";

                    return;

                }


                message.textContent =
                    "تمت إضافة الخدمة بنجاح";


                form.reset();


                await loadServices();


                setTimeout(
                    function () {

                        closeModal(
                            "serviceModal"
                        );

                        message.textContent =
                            "";

                    },
                    700
                );


            } catch (error) {

                message.textContent =
                    "تعذر الاتصال بالسيرفر";

            }

        }
    );


/* =====================================================
   REFRESH
===================================================== */

document
    .getElementById("refreshProducts")
    .addEventListener(
        "click",
        loadProducts
    );


document
    .getElementById("refreshServices")
    .addEventListener(
        "click",
        loadServices
    );


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   START
===================================================== */

checkLogin();