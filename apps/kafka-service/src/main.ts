
import {kafka} from "../../../packages/utils/kafka/index";
import { updateUserAnalytics } from "./services/analytics-service";

const consumer = kafka.consumer({ groupId: "user-event-group" });


const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (event.action === "shop_visit") {
      // update shop analytics in the future work
    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "remove_from_cart",
      "remove_from_wishlist",
    ];
    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }
    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log("Error processing event:", error);
    }
  }
};

setInterval(processQueue, 3000); // 3000 ms = 3s to start processing

// Add this before creating the consumer
console.log('Kafka configuration:', {
  brokers: ["pkc-619z3.us-east1.gcp.confluent.cloud:9092"],
  hasApiKey: !!process.env.KAFKA_API_KEY,
  hasApiSecret: !!process.env.KAFKA_API_SECRET,
  apiKeyLength: process.env.KAFKA_API_KEY?.length,
  apiSecretLength: process.env.KAFKA_API_SECRET?.length
});

// kafka consumer for user events
export const consumeKafkaMessages = async () => {
  // connect to the kafka broker
  await consumer.connect();
  await consumer.subscribe({ topic: "users-events", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    },
  });
};

consumeKafkaMessages().catch(console.error);

