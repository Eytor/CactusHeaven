const orderSchema = require('./schema/order');
const orderItemSchema = require('./schema/orderItem');
const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb+srv://VeftHopur:Lykilord@clusterveft-dwz26.mongodb.net/cactus_heaven', {
    useNewUrlParser: true
});

module.exports = {
    Order: connection.model('Order', orderSchema),
    OrderItem: connection.model('OrderItem', orderItemSchema)
};
