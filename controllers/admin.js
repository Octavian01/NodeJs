const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('admin/edit-product', {
        path: '/admin/add-product',
        pageTitle: 'Adding products',
        editing: false,
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = image.path;
    const product = new Product({title: title, price: price, description: description, imageUrl: imageUrl, userId: req.user});
    product.save()
        .then(result => {
            res.redirect('/admin/products');        
        })
        .catch(err => {
            throw err;
        })    
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) return res.redirect('/');
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        if (!product) return res.redirect('/');
        res.render('admin/edit-product', {
            path: '/admin/edit-product',
            pageTitle: 'Editing products',
            editing: editMode,
            product: product,
        });
    }). catch(err => {
        if (err) throw err;
    })
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updateDesc = req.body.description;
    Product.findById(prodId)
    .then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        if (image) product.imageUrl = image.path;
        product.description = updateDesc;
        return product.save()
        .then(() => {
            res.redirect('/admin/products');
        })
    })

    .catch(err => {
        throw err;
    })
    
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id})
        .then(() => {
            console.log('asd');
            res.redirect('/admin/products'); 
        })
        .catch(err => {
            throw err;
        })
    res.redirect('/admin/products');
}

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin products',
            path: '/admin/products',
        });
    }).catch(err => {
        throw err;
    });
}