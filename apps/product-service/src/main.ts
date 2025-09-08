import express from 'express';
import cors from "cors";
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/product-routes';
import "./jobs/product-crone.job"



const app: express.Application = express();
app.use(express.json({ limit: "50mb" })); // Reduced from 100mb for security
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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