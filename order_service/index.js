const { Order, OrderItem } = require('./data/db');

const amqp = require('amqplib/callback_api');

const messageBrokerInfo = {
    exchanges: {
        order: 'order_exchange'
    },
    routingKeys: {
        createOrder: 'create_order'
    },
    queues: { 
        orderQueue: 'order_queue' 
    }
}

const createMessageBrokerConnection = () => new Promise((resolve, reject) => {
    amqp.connect('amqp://localhost', (err, conn) => {
        if (err) { reject(err); }
        resolve(conn);
    });
});

const createChannel = connection => new Promise((resolve, reject) => {
    connection.createChannel((err, channel) => {
        if (err) { reject(err); }
        resolve(channel);
    });
});

const configureMessageBroker = channel => {
    const { order } = messageBrokerInfo.exchanges;
    const { orderQueue } = messageBrokerInfo.queues;
    const { createOrder } = messageBrokerInfo.routingKeys;
    channel.assertExchange(order, 'direct', {durable: true});
    channel.assertQueue(orderQueue, { durable: false }); // Getur bara verið false af einhverri ástæðu???
    channel.bindQueue(orderQueue, order, createOrder);
};

const doTheThing = (data) => {
    var email = data.email;
    var totalPrice = 0;
    items = data.items;
    for(var index in items) {
        var item = items[index];
        item.rowPrice = item.unitPrice * item.quantity;
        totalPrice += item.rowPrice;
    }
    var newOrder = {customerEmail:email, totalPrice:totalPrice, orderDate:new Date() };
    Order.create(newOrder, function(err, result){
        if(err) console.log(err);
        else {
            for(var index in items) {
                var item = items[index];
                item.orderId = result._id;
                OrderItem.create(item, function(err, result){
                    if(err) console.log(err);
                    else console.log("New order item made: " + result);
                });
            }
        }
    })
};

(async () => {
    const messageBrokerConnection = await createMessageBrokerConnection();
    const channel = await createChannel(messageBrokerConnection);

    configureMessageBroker(channel);

    const { order } = messageBrokerInfo.exchanges;
    const { orderQueue } = messageBrokerInfo.queues;
    const { createOrder } = messageBrokerInfo.routingKeys;
    channel.consume(orderQueue, data => {
        const dataJson = JSON.parse(data.content.toString());
        const result = doTheThing(dataJson);
        
    });
})().catch(e => console.error(e));
