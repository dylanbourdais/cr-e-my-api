const { publicDecrypt } = require("crypto");
const express = require("express");

const fs = require("fs"); // file system
const path = require("path");

const pathProductsJSON = path.join(__dirname, "./data/products.json");

let products = JSON.parse(fs.readFileSync(pathProductsJSON).toString()); // string json --> objet js

const app = express();

app.use(express.json());

app.get("", (req, res) => {
  // res==>response
  console.log("requête entrante sur la homepage");
  res.send("Homepage");
});

app.get("/api/products", (req, res) => {
  res.status(200).send(products);
});

app.post("/api/products", (req, res) => {
  const product = req.body;

  product.id = products[products.length - 1].id + 1;

  products.push(product);

  res.status(201).send(products);
});

app.delete("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const product = products.find((product) => {
    return product.id === id;
  });

  if (!product) {
    return res.status(404).send(`This id "${id}" was not found`);
  }

  const productIndex = products.findIndex((product) => {
    return product.id === id;
  });

  products.splice(productIndex, productIndex + 1);

  res.status(200).send(products);
});

app.put("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const propToModify = req.body;

  const product = products.find((product) => {
    return product.id === id;
  });

  if (!product) {
    return res.status(404).send(`This id "${id}" was not found`);
  }

  const productIndex = products.findIndex((product) => {
    return product.id === id;
  });

  const prop = Object.keys(propToModify);

  prop.forEach((el) => {
    if (products[productIndex].hasOwnProperty(el) === false) {
      return res.status(404).send(`The property "${el}" doesn't exist`);
    }

    products[productIndex][el] = propToModify[el];
  });

  res.status(200).send(products);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Listenning on port 3000...")
);
