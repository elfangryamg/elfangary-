const whatsappNumber = "201068447584";


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

  const brand =
    document
      .getElementById("brand")
      .value
      .trim();

  const model =
    document
      .getElementById("model")
      .value
      .trim();

  const year =
    document
      .getElementById("year")
      .value
      .trim();


  const params = new URLSearchParams();


  if (brand) {
    params.set("brand", brand);
  }

  if (model) {
    params.set("model", model);
  }

  if (year) {
    params.set("year", year);
  }


  const response =
    await fetch(
      "/api/products?" +
      params.toString()
    );


  const products =
    await response.json();


  const grid =
    document.getElementById(
      "productsGrid"
    );


  if (!products.length) {

    grid.innerHTML = `
      <div class="empty">
        مفيش منتجات مطابقة للبحث.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    products.map(product => {

      const message =
        `السلام عليكم، عايز استفسر عن ${product.name}`;

      return `

        <article class="product-card">

          ${
            product.image

              ? `
                <img
                  src="${product.image}"
                  alt="${escapeHTML(product.name)}"
                >
              `

              : `
                <div class="no-image">
                  FANGARY
                </div>
              `
          }


          <div class="product-info">

            <h3>
              ${escapeHTML(product.name)}
            </h3>


            <p>
              ${
                escapeHTML(
                  [
                    product.brand,
                    product.model,
                    product.year,
                    product.side
                  ]
                  .filter(Boolean)
                  .join(" • ")
                )
              }
            </p>


            ${
              product.price
                ? `
                  <strong>
                    ${escapeHTML(product.price)}
                    جنيه
                  </strong>
                `
                : ""
            }


            <a
              href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}"
              target="_blank"
              class="btn small"
            >
              اسأل على واتساب
            </a>

          </div>

        </article>

      `;

    }).join("");

}


/* =========================
   LOAD SERVICES
========================= */

async function loadServices() {

  const response =
    await fetch(
      "/api/services"
    );


  const services =
    await response.json();


  const grid =
    document.getElementById(
      "servicesGrid"
    );


  if (!services.length) {

    grid.innerHTML = `
      <div class="empty">
        الخدمات هتظهر هنا بعد إضافتها من لوحة التحكم.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    services.map(service => {

      return `

        <article class="product-card">

          ${
            service.image

              ? `
                <img
                  src="${service.image}"
                  alt="${escapeHTML(service.name)}"
                >
              `

              : `
                <div class="no-image">
                  SERVICE
                </div>
              `
          }


          <div class="product-info">

            <h3>
              ${escapeHTML(service.name)}
            </h3>


            <p>
              ${escapeHTML(
                service.description || ""
              )}
            </p>


            ${
              service.price

                ? `
                  <strong>
                    ${escapeHTML(service.price)}
                  </strong>
                `

                : ""
            }

          </div>

        </article>

      `;

    }).join("");

}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

  return String(value || "")
    .replace(
      /[&<>"']/g,
      function (character) {

        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        };

        return map[character];

      }
    );

}
function showAllProducts() {
  loadProducts();
}

/* =========================
   START
========================= */

loadProducts();
loadServices();