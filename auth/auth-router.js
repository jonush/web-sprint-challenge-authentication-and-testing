const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../users/users-model');
const { isValid } = require('../users/users-service');
const hidden = require('./var');

router.post('/register', (req, res) => {
  const credentials = req.body;

  if(isValid(credentials)) {
    const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcryptjs.hashSync(credentials.password, rounds);
    credentials.password = hash;

    Users.add(credentials)
      .then(user => {
        res.status(201).json({ data: user });
      })
      .catch(err => {
        console.log('POST to /register', err);
        res.status(500).json({ error: err.message });
      })
  } else {
    res.status(400).json({ error: "Missing username or password" });
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if(isValid(req.body)) {
    Users.findBy({ username: username })
      .then(([user]) => {
        // console.log('user', user);
        if(user && bcryptjs.compareSync(password, user.password)) {
          const token = createToken(user);
          res.status(200).json({ message: `Welcome to the API, ${user.username}`, token });
        } else {
          res.status(401).json({ message: "Invalid credentials" });
        }
      })
      .catch(err => {
        console.log('POST to /login', err);
        res.status(400).json({ message: err.message });
      })
  } else {
    res.status(500).json({ message: "Username and password are required" });
  }
});

const createToken = user => {
  const payload = {
    subject: user.id,
    username: user.username,
  };

  const secret = hidden.jwtSecret;

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, secret, options);
};

module.exports = router;
