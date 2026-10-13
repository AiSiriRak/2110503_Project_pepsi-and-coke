const express = require("express");

const { getCoworkingSpaces } = require("../controllers/coworkingSpaces");

const router = express.Router();

router.route("/").get(getCoworkingSpaces);

module.exports = router;
