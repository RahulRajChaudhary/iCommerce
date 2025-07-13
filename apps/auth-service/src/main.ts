import express from 'express';
import cors from "cors";
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';



const app = express();
app.use(express.json());
app.use(cookieParser())

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use(errorMiddleware);

const port = process.env.PORT ?? 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
})

server.on("error", (err) => {
  console.log("Server Error:", err)
})


