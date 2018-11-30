require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./database/dbConfig.js");

const server = express();

server.use(express.json());
server.use(cors());

const generateToken = user => {
  const payload = {
    subject: user.id,
    username: user.username,
    roles: ["sales", "marketing"]
  };
  const secret = process.env.JWT_SECRET;
  const options = {
    expiresIn: "5m"
  };
  return jwt.sign(payload, secret, options);
};

server.post("/api/login", (req, res) => {
  // grab username and password from body
  const creds = req.body;
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        // user exists by that username and passwords match
        const token = generateToken(user);
        res.status(200).json({ message: "Welcome!", token: token });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(err => res.status(500).json(err));
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
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "Token is invalid." });
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "No token provided, so get lost." });
  }
};

const checkRole = role => {
  return function(req, res, next) {
    if (req.decodedToken && req.decodedToken.roles.includes(role)) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "You don't have access to this resource." });
    }
  };
};

// protect this route, only authenticated users should see it
server.get("/api/users", protected, checkRole("sales"), (req, res) => {
  db("users")
    .select("id", "username")
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.listen(3300, () => console.log("\nrunning on port 3300\n"));
