const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key : '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'
    }
}))

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: '',
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: ''
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    return User.findOne({email: email})
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: `E-mail ${email} wasn't found`,
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: 'email'
                })
            }
            bcrypt
            .compare(password, user.password)
            .then(doMatch => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        res.redirect('/');
                    });
                }
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: `Password is incorrect`,
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: 'password'
                })
            })
            .catch(err => {
                throw err;
            })
        })
    
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) throw err;
        res.redirect('/');
    }) 
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .render('auth/signup', {
                path: '/signup',
                pageTitle: 'Signup',
                errorMessage: errors.array()[0].msg, 
                oldInput: {
                    email: email,
                    password: password,
                    confirmPassword: req.body.confirmPassword
                },
                validationErrors: errors.array()
            });
    }
    if (password !== confirmPassword) {
        req.flash('sign-up-error', 'Please, verify your password');
        res.redirect('/signup');
    }
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        const user = new User({
            email: email,
            password: hashedPassword,
            cart: { item: [] }
        });
        return user.save();
    })
    .then(result => {
        res.redirect('/login');
        return transporter.sendMail({
            to: email,
            from: 'octavian4ik.mitu@gmail.com',
            subject: 'Signup succeeded',
            html: '<h1>Nu si iubire, tot la mine pe sait ajungi :D?</h1><br><hr><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTTmItSr5ttjEg12KcikMdWSmdryz3CS0b3xfni3zalvMnhcpV6&usqp=CAU">'
        })  
    })
    .catch(err => {
        throw err;
    })
}

exports.getSignup = (req ,res, next) => {
    let message = req.flash('sign-up-error');
    message = message.length > 0 ? message[0] : null;
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message, 
        oldInput: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: []
    });
}; 

exports.getReset = (req, res, next) => {
    let message = req.flash('reset-error');
    message = message.length > 0 ? message[0] : null;
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset password',
        errorMessage: message,
    })
}

exports.postReset = (req, res, next) => {
    const email = req.body.email;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: email})
        .then(user => {
            if (!user) {
                req.flash('reset-error', `${email} is not part of our community. Please register`);
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetExpiration = Date.now() + 3600000;
            return user.save();  
        })
        .then(result => {
            req.flash('reset-success', `The e-mail was sent to ${email}. Verifica-ti e-mailu uitucule!`);
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'octavian4ik.mitu@gmail.com',
                subject: 'Reset password',
                html: `<h1>Nu si iubire, cu gandul la mine si apare scleroza?</h1><br>
                <h3>
                    Click this link for reseting password:
                </h3>
                <a href="http://localhost:3801/reset/${token}">Reseting password</a>
                <br><hr><br><br>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTTmItSr5ttjEg12KcikMdWSmdryz3CS0b3xfni3zalvMnhcpV6&usqp=CAU"></img>`
            })    
        })
        .catch(err => {
            throw err;
        })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    let successReset = req.flash('succes-resset-password');
    successReset = successReset.length > 0 ? successReset[0] : null;
    User.findOne({resetToken: token, resetExpiration: {$gt: Date.now()}})
        .then(user => {
            let message = req.flash('sign-up-error');
            message = message.length > 0 ? message[0] : null;
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New password',
                errorMessage: message,
                userId: user._id.toString(),
                successReset: successReset,
                passwordToken: token,
            })
        })
        .catch(err => {
            throw err;
        })    
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetExpiration: {$gt: Date.now()},
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = null;
            resetUser.resetExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            throw err;
        })
}