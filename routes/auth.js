const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup',
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req}) => { 
            // if (value === 'test@test.com') {
            //     throw new Error('error');
            // }
            // return true;
            return User.findOne({email: value})
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject(
                            `E-Mail ${userDoc.email} is already taken`
                        );
                    }
                })  
        }),
        body(
            'password',
            'Enter a password with min 5 alphanumeric characters'
        )
            .isLength({min: 5})
            .isAlphanumeric(),
            body('confirmPassword').custom((value, {req}) => {
                if (value !== req.body.password) {
                    throw new Error('Password have to match!');
                }
                return true;
            }),

    ],
    authController.postSignup
    );
router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router; 