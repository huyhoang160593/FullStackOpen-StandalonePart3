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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

function generateId() {
  let maxId = 0;
  if (persons.length > 0) {
    maxId = Math.max(...persons.map((person) => person.id));
  }
  return maxId + 1;
}

app.get("/api/persons", (_, response, next) => {
  Contact.find({})
    .then((result) => {
      response.json(result).end();
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((currentPerson) => currentPerson.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return next({
      name: "MissingParamsError",
      message: "name missing",
    });
    // return response.status(400).json({
    //   error: "name missing",
    // });
  }

  if (!body.number) {
    return next({
      name: "MissingParamsError",
      message: "number missing",
    });
    // return response.status(400).json({
    //   error: "number missing",
    // });
  }

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
  // if (!!persons.find((person) => person.name === body.name)) {
  //   return response.status(400).json({
  //     error: "name must be unique",
  //   });
  // }

  // const person = {
  //   id: generateId(),
  //   name: body.name,
  //   number: body.number,
  // };

  // persons = [...persons, person];
  // response.json(person);
});

app.delete("/api/persons/:id", (request, response, next) => {
  // const id = Number(request.params.id);
  // persons = persons.filter((person) => person.id !== id);
  Contact.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
      // response.status(400).json({
      //   error: `The contact with id ${request.params.id} had been deleted or not exist`
      // }).end()
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
  if (error.name === 'MissingParamsError') {
    return response.status(400).send({ error: error.message })
  }

  next(JSON.stringify(error));
};

// handler of request with result to errors, must be use just before app.listen()
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
