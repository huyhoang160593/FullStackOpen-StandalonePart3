require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Contact = require("./models/contact");

morgan.token("body", (req, res) => (req.body ? JSON.stringify(req.body) : "-"));

const app = express();
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(cors());
app.use(express.static("build"));

app.get("/api/persons", (_, response, next) => {
  Contact.find({})
    .then((result) => {
      response.json(result).end();
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  // if (!body.name) {
  //   return next({
  //     name: "MissingParamsError",
  //     message: "name missing",
  //   });
  // }

  // if (!body.number) {
  //   return next({
  //     name: "MissingParamsError",
  //     message: "number missing",
  //   });
  // }

  const contact = new Contact({
    name: body.name,
    number: body.number,
  });

  contact
    .save()
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const contact = {
    name: body.name,
    number: body.number,
  };

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true, runValidators: true, context: 'query' })
    .then((updatedContact) => response.json(updatedContact))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

app.get("/info", (_, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write(`Phonebook has info for ${persons.length} people \n\n`);
  response.end(new Date().toString());
});

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  if (error.name === "MissingParamsError") {
    return response.status(400).send({ error: error.message });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// handler of request with result to errors, must be use just before app.listen()
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
