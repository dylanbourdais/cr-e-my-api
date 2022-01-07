const { publicDecrypt } = require("crypto");
const express = require("express");
const Joi = require("joi");

const fs = require("fs"); // file system
const path = require("path");

const pathProductsJSON = path.join(__dirname, "./data/products.json");

const products = JSON.parse(fs.readFileSync(pathProductsJSON).toString()); // string json --> objet js

const app = express();

app.use(express.json());

const verifyRequest = (body = {}, productId = undefined) => {
  let product = {};
  if (productId) {
    product = products.find((product) => {
      return product.id === productId;
    });
  }

  // on crée le schema du body de la requête attendu
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

  // On vérifie la requête
  const { error } = schema.validate(body, { abortEarly: false });

  // si le schema de la requête reçue ne correspond pas à celle attendu
  let err = [];
  if (error) {
    error.details.forEach((el) => {
      err.push(el.message);
    });
  }

  return { product: product, error: err };
};

app.get("", (req, res) => {
  // res==>response
  console.log("requête entrante sur la homepage");
  res.send("Homepage");
});

app.get("/api/products", (req, res) => {
  res.status(200).send(products);
});

app.get("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id); // on récupère l'id situé dans l'url

  const { product } = verifyRequest({}, id);
  if (!product) {
    return res.status(404).send(`This id "${id}" was not found`);
  }

  res.status(200).send(product);
});

app.post("/api/products", (req, res) => {
  const product = req.body;

  // on vérifie si le body de la requête est correct
  const { error } = verifyRequest(product);
  if (error.length !== 0) {
    return res.status(400).send(error.toString());
  }
  product.id = products[products.length - 1].id + 1;

  products.push(product);

  res.status(201).send(product);
});

app.delete("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const { product } = verifyRequest({}, id);
  if (!product) {
    return res.status(404).send(`This id "${id}" was not found`);
  }

  // on supprime le produit selon son id
  const productIndex = products.findIndex((product) => {
    return product.id === id;
  });

  products.splice(productIndex, 1);

  res.status(200).send(product);
});

app.put("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const propToModify = req.body;

  const { error, product } = verifyRequest(propToModify, id);
  if (!product) {
    return res.status(404).send(`This id "${id}" was not found`);
  }
  if (error.length !== 0) {
    return res.status(400).send(error.toString());
  }

  // sinon on modifie le produit
  for (let property in propToModify) {
    product[property] = propToModify[property];
  }

  res.status(200).send(product);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Listenning on port 3000...")
);
