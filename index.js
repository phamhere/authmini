const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

const db = require("./database/dbConfig.js");

const server = express();

const sessionConfig = {
  name: "monkey",
  secret: "as;ldfnvjioamsdapon3pamdpo",
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false // in production you want this to be true, only set over https
  },
  httpOnly: true, // no js can touch this cookie
  resave: false,
  saveUninitialized: false,
  store: new KnexSessionStore({
    tablename: "sessions",
    sidfieldname: "sid",
    knex: db,
    createtable: true,
    clearInterval: 1000 * 60 * 60
  })
};

server.use(session(sessionConfig)); // wires up session management
server.use(express.json());
server.use(cors());

server.post("/api/login", (req, res) => {
  // grab username and password from body
  const creds = req.body;
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        // user exists by that username and passwords match
        req.session.userId = user.id;
        res.status(200).json({ message: "Welcome!" });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(err => res.status(500).json(err));
});

server.get("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.send("You can never leave.");
      } else {
        res.send("Bye!");
      }
    });
  } else {
    res.end();
  }
});

server.post("/api/register", (req, res) => {
  // grab username and password from body
  const creds = req.body;
  // generate the hash from the user's password
  const hash = bcrypt.hashSync(creds.password, 14);
  // override the user.password with the hash
  creds.password = hash;
  // save the user to the database
  db("users")
    .insert(creds)
    .then(ids => {
      res.status(201).json(ids);
    })
    .catch(err => {
      console.dir(err);
      res.status(500).json(err);
    });
});

server.get("/", (req, res) => {
  res.send("Its Alive!");
});

const protected = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "You shall not pass!" });
  }
};

// protect this route, only authenticated users should see it
server.get("/api/users", protected, (req, res) => {
  db("users")
    .select("id", "username")
    .where({ id: req.session.userId })
    .first()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.listen(3300, () => console.log("\nrunning on port 3300\n"));
