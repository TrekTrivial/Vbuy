const express = require("express");
const router = new express.Router();
const db = require("../db").db;
const auth = require("../middleware/auth");
const shipping = require("../services/shiprocket");
const { orderEmail } = require("../utils/email");
const { getBookInfo } = require("../services/googlebooks");

router.post("/create", shipping.getAuthTokenSR, auth, async (req, res) => {
  const { id, email } = req.user;
  const SRtoken = req.SRtoken;
  const orderDetails = req.body;

  const orderID = orderDetails.order_id;

  try {
    const [user] = await db.query(
      `SELECT firstName, lastName FROM USERS WHERE userID=?`,
      [id]
    );

    const name = user[0].firstName + " " + user[0].lastName;

    const [result] = await db.query(
      `SELECT cartID, cartTotal, quantity FROM CART WHERE userID=? AND cartStatus=?`,
      [id, "not empty"]
    );

    let count = 0;
    result[0].quantity.forEach(num => (count += num));

    const response = await shipping.createOrder(SRtoken, orderDetails);
    const sql1 = `INSERT INTO ORDERS (orderID, userID, cartID, item_count, orderTotal, orderDate, orderStatus) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const response1 = await db.query(sql1, [
      orderID,
      id,
      result[0].cartID,
      count,
      result[0].cartTotal,
      orderDetails.order_date,
      "Confirmed",
    ]);

    const { order_id, shipment_id } = response;

    const [address] = await db.query(
      `SELECT addressID FROM USER_ADDRESS WHERE userID=?`,
      [id]
    );

    const sql2 = `INSERT INTO SHIPPING (shippingID, ship_orderID, orderID, addressID) VALUES (?, ?, ?, ?)`;
    await db.query(sql2, [
      shipment_id,
      order_id,
      orderID,
      address[0].addressID,
    ]);

    await orderEmail("order_confirm", name, email, orderID);

    res.status(201).send({ shipment_id, order_id });
  } catch (e) {
    res.status(500).send({ error: "Database error", e: e.message });
  }
});

router.patch(
  "/create/awb/:shipment_id",
  shipping.getAuthTokenSR,
  auth,
  async (req, res) => {
    const { shipment_id } = req.params;
    const SRtoken = req.SRtoken;

    try {
      const { response } = await shipping.generateShipment(
        SRtoken,
        shipment_id
      );
      const { awb_code, transporter_name } = response.data;

      const sql = `UPDATE SHIPPING SET AWBnumber=?, AWB_transporter=?, shippingStatus=? WHERE shippingID=?`;
      await db.query(sql, [
        awb_code,
        transporter_name,
        "In transit",
        shipment_id,
      ]);

      const [ship] = await db.query(
        `SELECT orderID FROM SHIPPING WHERE shippingID=?`,
        [shipment_id]
      );

      await db.query(`UPDATE ORDERS SET orderStatus=? WHERE orderID=?`, [
        "Completed",
        ship[0].orderID,
      ]);

      res.status(200).send({ message: "AWB created" });
    } catch (e) {
      res.status(500).send({ error: "Database error", e });
    }
  }
);

router.post(
  "/cancel/:order_id",
  shipping.getAuthTokenSR,
  auth,
  async (req, res) => {
    const { order_id } = req.params;
    const { id, email } = req.user;
    const SRtoken = req.SRtoken;

    try {
      const [user] = await db.query(
        `SELECT firstName, lastName FROM USERS WHERE userID=?`,
        [id]
      );
      const name = user[0].firstName + " " + user[0].lastName;

      const response = await shipping.cancelOrder(SRtoken, [order_id]);

      const [ship] = await db.query(
        `SELECT orderID FROM SHIPPING WHERE ship_orderID=?`,
        [order_id]
      );

      await db.query(`UPDATE ORDERS SET orderStatus=? WHERE orderID=?`, [
        "Cancelled",
        ship[0].orderID,
      ]);

      await orderEmail("order_cancel", name, email, ship[0].orderID);

      res.status(202).send({ message: "Order cancelled" });
    } catch (e) {
      res.status(500).send({ error: "Database error", e });
    }
  }
);

router.post(
  "/invoice/:order_id",
  shipping.getAuthTokenSR,
  auth,
  async (req, res) => {
    const SRtoken = req.SRtoken;
    const { order_id } = req.params;

    try {
      const response = await shipping.generateInvoice(SRtoken, [order_id]);

      const { invoice_url } = response;

      await db.query(`UPDATE SHIPPING SET invoiceLink=? WHERE ship_orderID=?`, [
        invoice_url,
        order_id,
      ]);

      res.status(200).send({ message: "Invoice generated", invoice_url });
    } catch (e) {
      res.status(500).send({ error: "Database error", e });
    }
  }
);

router.get("/myorders", auth, async (req, res) => {
  const { id } = req.user;

  try {
    const [result] = await db.query(`SELECT * FROM ORDERS WHERE userID=?`, [
      id,
    ]);

    res.status(200).send(result);
  } catch (e) {
    res.status(500).send({ error: "Database error", e: e.message });
  }
});

router.get("/myorders/:orderID", auth, async (req, res) => {
  const { orderID } = req.params;

  try {
    const [result] = await db.query(`SELECT * FROM ORDERS WHERE orderID=?`, [
      orderID,
    ]);

    res.status(200).send(result[0]);
  } catch (e) {
    res.status(500).send({ error: "Database error", e: e.message });
  }
});

router.get("/shipping/:orderID", auth, async (req, res) => {
  const { orderID } = req.params;

  try {
    const [result] = await db.query(`SELECT * FROM SHIPPING WHERE orderID=?`, [
      orderID,
    ]);
    res.status(200).send(result[0]);
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
    const mrp = Math.ceil(book.saleInfo?.retailPrice?.amount) || "N/A";

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

router.get("/cart", auth, async (req, res) => {
  const { id } = req.user;

  try {
    const [data] = await db.query(
      `SELECT * FROM CART WHERE userID=? AND cartStatus=?`,
      [id, "not empty"]
    );
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

router.get("/cart/done", auth, async (req, res) => {
  const { id } = req.user;

  try {
    const [data] = await db.query(
      `SELECT * FROM CART WHERE userID=? AND cartStatus=?`,
      [id, "fulfilled"]
    );
    res.status(200).send(data);
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

router.patch("/cart/changestatus", auth, async (req, res) => {
  const { id } = req.user;

  try {
    await db.query(
      `UPDATE CART SET cartStatus=? WHERE userID=? AND cartStatus=?`,
      ["fulfilled", id, "not empty"]
    );
    res.status(200).send();
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

module.exports = router;
