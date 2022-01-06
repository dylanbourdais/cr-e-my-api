const { publicDecrypt } = require("crypto");
const express = require("express");
const Joi = require("joi");

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

  products.splice(productIndex, 1);

  res.status(200).send(product);
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

  const schema = Joi.object({
    title: Joi.string(),
    price: Joi.number(),
    description: Joi.string(),
    category: Joi.string(),
    image: Joi.string(),
    rating: Joi.object({
      rate: Joi.number(),
      count: Joi.number(),
    }),
  });

  const { error } = schema.validate(propToModify);

  if (error) {
    return res.status(400).send("Invalid request data");
  }

  for (property in propToModify) {
    products[productIndex][property] = propToModify[property];
  }

  res.status(200).send(product);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Listenning on port 3000...")
);
