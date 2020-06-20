const express = require('express');
const router = express.Router();
const shopCotroller = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

router.get('/', shopCotroller.getIndex);

router.get('/products', shopCotroller.getProducts);

router.get('/products/:productId', shopCotroller.getProduct);

router.post('/cart-delete-item', isAuth, shopCotroller.postCartDeleteProduct);

router.get('/cart', isAuth, shopCotroller.getCart);

router.post('/cart', isAuth, shopCotroller.postCard);

router.post('/orders', isAuth, shopCotroller.postOrder);

router.get('/orders', isAuth, shopCotroller.getOrders);

module.exports = router;