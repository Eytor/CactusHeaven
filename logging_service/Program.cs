using System;
using System.IO;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace logging_service
{
    class Program
    {
        static void Main(string[] args)
        {
            const string exchange_name  = "order_exchange";
            const string queue_name     = "logging_queue";
            const string in_routing_key = "create_order";
            const string log_file       = "log.txt";

            var factory = new ConnectionFactory() {HostName = "localhost"};
            using(var connection = factory.CreateConnection())
            {
                using(var channel = connection.CreateModel())
                {
                    channel.QueueDeclare(queue: queue_name,
                                         durable: true,
                                         exclusive: false,
                                         autoDelete: false,
                                         arguments: null);

                    var consumer = new EventingBasicConsumer(channel);
                    consumer.Received += (model, ea) =>
                    {
                        var body = ea.Body;
                        var message = Encoding.UTF8.GetString(body);
                        using (StreamWriter file = new StreamWriter(log_file, true))
                        {
                            file.WriteLine("Log: " + message);
                        }
                        Console.WriteLine(" [x] Received {0}", message);
                    };
                    channel.QueueBind(queue_name, exchange_name, in_routing_key);
                    // channel.ExchangeBind(queue_name, exchange_name, in_routing_key);
                    channel.BasicConsume(queue: queue_name,
                                        autoAck: true,
                                        consumer: consumer);

                    Console.WriteLine(" Press [enter] to exit.");
                    Console.ReadLine();
                }
            }
        }
    }
}
