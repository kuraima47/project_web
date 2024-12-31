const express = require('express');
const { getCryptoPrices, getCryptoPricesWithId } = require('../controllers/cryptoController');

const router = express.Router();

// Route pour obtenir les prix de toutes les cryptomonnaies
router.get('/', getCryptoPrices);

// Route pour obtenir les prix d'une cryptomonnaie spécifique en fonction de son ID
router.get('/:id', getCryptoPricesWithId);

module.exports = router;
