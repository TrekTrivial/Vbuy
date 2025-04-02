const express = require("express");
const cors = require("cors");
const path = require("path");
require("./db").createTables();
require("dotenv").config();
const redirectIfAuthenticated = require("./middleware/authRedirect");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

const adminRouter = require("./routers/admins");
const userRouter = require("./routers/user");
const cartRouter = require("./routers/cart");
const orderRouter = require("./routers/order");
const warehouseRouter = require("./routers/warehouse");
const calculatorRouter = require("./routers/calculator");
const supportRouter = require("./routers/support");

app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
app.use("/warehouse", warehouseRouter);
app.use("/calculator", calculatorRouter);
app.use("/support", supportRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/register", redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/register.html"));
});

app.get("/login", redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/cart.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/about.html"));
});

app.get("/order", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/order.html"));
});

app.get("/sell", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/sell.html"));
});

app.get("/support", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/support.html"));
});

app.get("/placeorder", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/placeorder.html"));
});

app.get("/ticket", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/ticket.html"));
});

app.get("/track", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/trackorder.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server up and running on port ${PORT}!`));
