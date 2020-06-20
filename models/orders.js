const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Orders = new Schema({
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    },
    cart: {
        items: [
            {
                productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
                productTitle: {type: String, required: true},
                productPrice: {type: Number, required: true},
                quantity: {type: Number, required: true}
            }
        ]
    }
});

Orders.methods.addOrder = function(data) {

}

module.exports = mongoose.model('Orders', Orders);