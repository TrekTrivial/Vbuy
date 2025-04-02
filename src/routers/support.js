const express = require("express");
const router = new express.Router();
const db = require("../db").db;
const auth = require("../middleware/auth");
const { supportEmail, supportReply } = require("../utils/email");
const { fromWeb } = require("form-data");

router.post("/raise", auth, async (req, res) => {
  const { id, email } = req.user;
  const { issueSubject, issueMessage } = req.body;

  try {
    const [user] = await db.query(
      `SELECT firstName, lastName FROM USERS WHERE userID=?`,
      [id]
    );
    const name = user[0].firstName + " " + user[0].lastName;

    const [result] = await db.query(`SELECT * FROM SUPPORT WHERE userID=?`, [
      id,
    ]);
    const ticketID = id + "__supp__" + String(result.length + 1);

    const sql = `INSERT INTO SUPPORT (ticketID, userID, issueSubject, issueMessage, ticketStatus) VALUES (?, ?, ?, ?, ?)`;
    await db.query(sql, [ticketID, id, issueSubject, issueMessage, "Open"]);

    await supportEmail(name, email, ticketID);
    res.status(200).send({ message: "Ticket raised", ticketID });
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

router.get("/tickets", auth, async (req, res) => {
  const { id } = req.user;

  try {
    const [results] = await db.query(`SELECT * FROM SUPPORT WHERE userID=?`, [
      id,
    ]);

    if (results.length === 0) {
      return res.status(404).send({ error: "No tickets found" });
    }
    res.status(200).send(results);
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

router.get("/tickets/:ticketID", auth, async (req, res) => {
  const { ticketID } = req.params;

  try {
    const [results] = await db.query(`SELECT * FROM SUPPORT WHERE ticketID=?`, [
      ticketID,
    ]);

    if (results.length === 0) {
      return res.status(404).send({ error: "No tickets found" });
    }
    res.status(200).send(results[0]);
  } catch (e) {
    res.status(500).send({ error: "Database error", e });
  }
});

module.exports = router;
