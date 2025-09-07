import express from 'express';
import cors from "cors";
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/product-routes';


const app = express();
app.use(express.json());
app.use(cookieParser())

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send({ message: 'Hello Product API' });
});


// Routes
app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Product service is running at http://localhost:${port}/api`);
});

server.on("error", (err) => {
  console.log("Server Error:", err)
})