const Product = require('../models/product');
const Order = require('../models/orders');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
            });
        }).catch(err => {
            throw err;
        });
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
        });
    })
    .catch(err => {
        throw err;
    })
}

exports.postCard = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product => {
        return req.user.addToCart(product);
    }).then(products => {
        res.redirect('/cart');
    });
};

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items;
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'My cart',
            products: products,
        });
    })
}

exports.postCartDeleteProduct = (req, res, next) => {

    const prodId = req.body.productId;
    req.user
    .removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            throw err;
        })
} 

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                
            });
        }).catch(err => {
            throw err;
        });

}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
       path: '/checkout',
       pageTitle: 'Checkout',
    });
}

exports.getOrders = (req, res, next) => {
    Order.find()
        .then(result => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'My orders',
                orders: result,
            })
        })
        .catch(err => {
            throw err;
        })
}

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            console.log(user);
            const items = user.cart.items.map(i => {
                return {
                    productId: i.productId._id,
                    productTitle: i.productId.title,
                    productPrice: i.productId.price,
                    quantity: i.quantity,
                }
            });
            const newOrder = new Order({
                user: {
                    email: user.email,
                    userId: req.user
                },
                cart: {
                    items: items,
                }
            });
            user.cart = {};
            user.save();
            newOrder.save();
            res.redirect('/');
        })
        .catch(err => {
            throw err;
        })
}