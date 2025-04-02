const axios = require("axios");

const getBookInfo = async isbn => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${isbn}`;
  try {
    const { data } = await axios.get(url);
    if (data.totalItems === 0) {
      return undefined;
    }
    const book = data.items[0];
    return book;
  } catch (e) {
    console.error(e);
  }
};

const calculatePrice = (mrp, perc) => {
  return Math.ceil(mrp * perc);
};

module.exports = {
  getBookInfo,
  calculatePrice,
};
