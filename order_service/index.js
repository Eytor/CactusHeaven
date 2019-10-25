const amqp = require('amqplib/callback_api');
const { Order, OrderItem } = require('./data/db');

const messageInfo = {
    exchanges: { order: 'order_exchange' },
    queues: { orderQueue: 'order_queue' },
    routingKeys: { createOrder: 'create_order' }
}

const messageConnection = () => new Promise((resolve, reject) =>
    amqp.connect('amqp://localhost', (err, conn) => err ? reject(err) : resolve(conn)));

const createChannel = connection => new Promise((resolve, reject) =>
    connection.createChannel((err, channel) => err ? reject(err) : resolve(channel)));

//const createIntoDB = data => {
//    let order = new Order({
//        orderDate: new Date()
//    });
//    order.save((error, newOrder) => {
//            const { items } = data;
//            if(items && Array.isArray(items)) {
//            for (let i = 0; i < items.length; i++) {
//                OrderItem.create({
//                    description: items[i].description,
//                    unitPrice: items[i].unitPrice,
//                    quantity: items[i].quantity,
//                    rowPrice: items[i].quantity * items[i].unitPrice,
//                    orderId: newOrder._id
//                }, error => {
//                }
//                );
//            }
//            }
//            else console.log('Failiure');
//        }
//    );
//}

(async () => {
    console.log(`We are here order service`);
    const messageBrokerConnection = await createMessageBrokerConnection();
    const channel = await createChannel(messageBrokerConnection);
    configureMessageBroker(channel);
    const { addQueue } = messageBrokerInfo.queues;
    channel.consume(addQueue, data => {
        const dataJson = JSON.parse(data.content.toString());
    }, { noAck: true });

})().catch(e => console.error(e));