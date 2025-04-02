const express = require("express");
const router = new express.Router();
const db = require("../db").db;
const auth = require("../middleware/auth");
const { getBookInfo } = require("../services/googlebooks");

router.post("/additem", auth, async (req, res) => {
  const { isbn, quantity } = req.body;
  let { costPrice } = req.body;
  costPrice = Number(costPrice);
  const { id } = req.user;
  const cartStatus = "not empty";

  try {
    const [result] = await db.query(
      `SELECT * FROM CART WHERE userID=? AND cartStatus=?`,
      [id, "fulfilled"]
    );
    const num = result.length;
    const cartID = `${id}__cart_${num + 1}`;

    const [results] = await db.query(`SELECT * FROM CART WHERE cartID=?`, [
      `${id}__cart_${num + 1}`,
    ]);

    if (results.length === 0) {
      await db.query(
        `INSERT INTO CART (cartID, userID, isbn, quantity, costPrice, cartTotal, cartStatus) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          cartID,
          id,
          JSON.stringify([isbn]),
          JSON.stringify([quantity]),
          JSON.stringify([costPrice]),
          costPrice * quantity,
          cartStatus,
        ]
      );
      return res.status(201).send({ message: "Added to cart" });
    } else if (results.length === 1) {
      const cart = results[0];

      const cartTotal = Number(cart.cartTotal) + costPrice * quantity;
      const count = cart.isbn.filter(ISBN => ISBN === isbn);
      if (count.length !== 0) {
        const index = cart.isbn.indexOf(isbn);
        const sql = `UPDATE CART SET quantity=JSON_SET(quantity, '$[${index}]', ?), costPrice=JSON_SET(costPrice, '$[${index}]', ?), cartTotal=?, cartStatus=? WHERE cartID=?`;
        await db.query(sql, [
          quantity + cart.quantity[index],
          costPrice,
          cartTotal,
          cartStatus,
          `${id}__cart_${num + 1}`,
        ]);
        return res.status(200).send({ message: "Cart updated" });
      }
      const sql = `UPDATE CART SET isbn=JSON_ARRAY_APPEND(isbn, '$', ?), quantity=JSON_ARRAY_APPEND(quantity, '$', ?), costPrice=JSON_ARRAY_APPEND(costPrice, '$', ?), cartTotal=?, cartStatus=? WHERE cartID=?`;
      await db.query(sql, [
        isbn,
        quantity,
        costPrice,
        cartTotal,
        cartStatus,
        `${id}__cart_${num + 1}`,
      ]);

      res.status(200).send({ message: "Cart updated" });
    }
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

router.get("/", auth, async (req, res) => {
  const { id } = req.user;
  const sql = `SELECT * FROM CART WHERE userID=? and cartStatus=?`;
  try {
    const [result] = await db.query(sql, [id, "not empty"]);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

router.delete("/delete/:cartID", auth, async (req, res) => {
  const { cartID } = req.params;
  const sql = `DELETE FROM CART WHERE cartID=?`;
  try {
    await db.query(sql, [cartID]);
    res.status(200).send({ message: "Cart emptied!" });
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

router.post("/remove", auth, async (req, res) => {
  const { cartID, isbn } = req.body;

  try {
    const [result] = await db.query(`SELECT * FROM CART WHERE cartID=?`, [
      cartID,
    ]);
    const cart = result[0];
    const index = cart.isbn.indexOf(isbn);

    const cartTotal =
      Number(cart.cartTotal) - cart.quantity[index] * cart.costPrice[index];

    await db.query(
      `UPDATE CART SET isbn=JSON_REMOVE(isbn, '$[?]'), quantity=JSON_REMOVE(quantity, '$[?]'), costPrice=JSON_REMOVE(costPrice, '$[?]'), cartTotal=? WHERE cartID=?`,
      [index, index, index, cartTotal, cartID]
    );
    res.status(200).send({ message: "Cart updated!" });
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

router.get("/book/:isbn", async (req, res) => {
  const { isbn } = req.params;

  try {
    const book = await getBookInfo(isbn);

    if (!book) {
      const result = {
        title: "Couldn't find title",
        authors: "Couldn't find author",
        mrp: "Couldn't find MRP",
      };
      return res.status(200).send(result);
    }

    const title = book.volumeInfo.title || "Title unknown";
    const authors = book.volumeInfo.authors?.join(", ") || "Author(s) unknown";
    const mrp = Math.ceil(book.saleInfo?.listPrice?.amount) || "N/A";

    const result = {
      title,
      authors,
      mrp,
    };

    res.status(200).send(result);
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

module.exports = router;
