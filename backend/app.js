const express = require("express");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15min
  max: 100,
});

const API_URL = "https://v6.exchangerate-api.com/v6/"; // https://v6.exchangerate-api.com/v6/YOUR-API-KEY/pair/EUR/GBP
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

//CORS Options
const corsOptions = {
  origin: ["http://localhost:5173"],
};

//Middlewares
app.use(express.json());
app.use(apiLimiter);
app.use(cors(corsOptions));

//Conversion
app.post("/api/convert", async (req, res) => {
  try {
    //Getting user Data
    const { from, to, amount } = req.body;

    //COnstructing URL
    const url = `${API_URL}${API_KEY}/pair/${from}/${to}/${amount}`;
    const response = await axios.get(url);
    if (response.data && response.data.result === "success") {
      res.json({
        base: from,
        target: to,
        conversionRate: response.data.conversion_rate,
        conversionResult: response.data.conversion_result,
      });
    } else {
      res
        .status(400)
        .json({ message: "Error Converting Currency", details: response.data });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error Converting Currency", details: error.message });
  }
});

//Start Server
app.listen(PORT, console.log(`Server Started on Port: ${PORT}`));
