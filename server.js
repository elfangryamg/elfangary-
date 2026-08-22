const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const publicDir = path.join(__dirname, "public");

const uploadDir = path.join("/tmp", "uploads");
const dataFile = path.join("/tmp", "data.json");

fs.mkdirSync(uploadDir, { recursive: true });

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(
    dataFile,
    JSON.stringify(
      {
        products: [],
        services: []
      },
      null,
      2
    )
  );
}

function readData() {
  return JSON.parse(
    fs.readFileSync(dataFile, "utf8")
  );
}

function saveData(data) {
  fs.writeFileSync(
    dataFile,
    JSON.stringify(data, null, 2)
  );
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(express.static(publicDir));
app.use(
  "/uploads",
  express.static(uploadDir)
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const safeName =
      file.originalname.replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      );

    cb(
      null,
      Date.now() + "-" + safeName
    );
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

function requireAdmin(req, res, next) {
  if (req.session.admin) {
    return next();
  }

  res.status(401).json({
    error: "غير مصرح"
  });
}


/* LOGIN */

app.post("/api/login", (req, res) => {

  const {
    username,
    password
  } = req.body;

  if (
    username === ADMIN_USER &&
    password === ADMIN_PASSWORD
  ) {

    req.session.admin = true;

    return res.json({
      ok: true
    });
  }

  res.status(401).json({
    error:
      "اسم المستخدم أو كلمة المرور غير صحيحة"
  });
});


app.post("/api/logout", (req, res) => {

  req.session.destroy(() => {

    res.json({
      ok: true
    });

  });

});


app.get("/api/me", (req, res) => {

  res.json({
    admin: !!req.session.admin
  });

});


/* PRODUCTS */

app.get("/api/products", (req, res) => {

  const data = readData();

  let products = data.products;

  const {
    brand,
    model,
    year
  } = req.query;

  if (brand) {
    products = products.filter(
      p =>
        p.brand.toLowerCase() ===
        brand.toLowerCase()
    );
  }

  if (model) {
    products = products.filter(
      p =>
        p.model.toLowerCase() ===
        model.toLowerCase()
    );
  }

  if (year) {
    products = products.filter(
      p =>
        p.year.toLowerCase() ===
        year.toLowerCase()
    );
  }

  res.json(
    products.reverse()
  );
});


app.post(
  "/api/products",
  requireAdmin,
  upload.single("image"),
  (req, res) => {

    const data = readData();

    const {
      name,
      brand,
      model,
      year,
      side,
      price,
      available
    } = req.body;

    if (!name) {

      return res.status(400).json({
        error: "اسم المنتج مطلوب"
      });

    }

    const product = {

      id: Date.now(),

      name,

      brand: brand || "",

      model: model || "",

      year: year || "",

      side: side || "",

      price: price || "",

      image: req.file
        ? "/uploads/" + req.file.filename
        : "",

      available:
        available !== "0",

      createdAt:
        new Date().toISOString()

    };

    data.products.push(product);

    saveData(data);

    res.json({
      ok: true,
      product
    });

  }
);


app.delete(
  "/api/products/:id",
  requireAdmin,
  (req, res) => {

    const data = readData();

    const id =
      Number(req.params.id);

    data.products =
      data.products.filter(
        p => p.id !== id
      );

    saveData(data);

    res.json({
      ok: true
    });

  }
);


/* SERVICES */

app.get("/api/services", (req, res) => {

  const data = readData();

  res.json(
    [...data.services].reverse()
  );

});


app.post(
  "/api/services",
  requireAdmin,
  upload.single("image"),
  (req, res) => {

    const data = readData();

    const {
      name,
      description,
      price
    } = req.body;

    if (!name) {

      return res.status(400).json({
        error: "اسم الخدمة مطلوب"
      });

    }

    const service = {

      id: Date.now(),

      name,

      description:
        description || "",

      price:
        price || "",

      image: req.file
        ? "/uploads/" + req.file.filename
        : "",

      createdAt:
        new Date().toISOString()

    };

    data.services.push(service);

    saveData(data);

    res.json({
      ok: true,
      service
    });

  }
);


app.delete(
  "/api/services/:id",
  requireAdmin,
  (req, res) => {

    const data = readData();

    const id =
      Number(req.params.id);

    data.services =
      data.services.filter(
        s => s.id !== id
      );

    saveData(data);

    res.json({
      ok: true
    });

  }
);


/* ADMIN */

app.get("/admin", (req, res) => {

  res.sendFile(
    path.join(
      publicDir,
      "admin.html"
    )
  );

});


/* ERROR */

app.use(
  (err, req, res, next) => {

    console.error(err);

    res.status(400).json({
      error:
        err.message ||
        "حدث خطأ"
    });

  }
);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Alfangary website running on port ${PORT}`);
  });
}

module.exports = app;