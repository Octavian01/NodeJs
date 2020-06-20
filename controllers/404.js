module.exports = (req, res, next) => {
    res.render('404', {
        pageTitle: 'Not Found',
        path: '/404',
        isAuthenticated: req.isLoggedIn
    });
}