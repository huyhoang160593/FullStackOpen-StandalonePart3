const express = require("express");
const app = express();

const persons = [
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

app.get("/api/persons", (_, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(currentPerson => currentPerson.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.get("/info", (_, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write(`Phonebook has info for ${persons.length} people \n\n`)
  response.end(new Date().toString())
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
