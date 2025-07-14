import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Auth Service",
    description: "Auth Service Auto generated API documentation",
  },
  host: "localhost:6001",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.-router.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
