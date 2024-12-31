const express = require('express');
const { getCryptoPrices, getCryptoPricesWithName } = require('../controllers/cryptoController');

const router = express.Router();

// Route pour obtenir les prix de toutes les cryptomonnaies
router.get('/', getCryptoPrices);

// Route pour obtenir les prix d'une cryptomonnaie spécifique en fonction de son ID
router.get('/:cryptoName', getCryptoPricesWithName);

module.exports = router;
