const fetch = require('node-fetch');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const hbs = require("hbs");
const { MongoClient } = require('mongodb'); // Import MongoClient from mongodb



const app = express();
const port = 3000;
const mongoURI = 'mongodb://localhost:27017/sportsdb';
const viewPath = path.join(__dirname, "/views");
const partialsPath = path.join(__dirname, "/partials");

app.set("views", viewPath);
app.set('view engine', 'hbs');
hbs.registerPartials(partialsPath);

//koneksi untuk ke mongodb
mongoose.connect('mongodb://localhost:27017/sportsdb');
const db = mongoose.connection;


// Check MongoDB connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define a user schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// buat user model
const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // membuat user baru
    const newUser = new User({
      username,
      password,
    });

    // menyimpan user ke database
    await newUser.save();

    res.redirect('/login');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/login', (req, res) => {
  res.render('login');
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user dengan username yang diberikan
    const user = await User.findOne({ username });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    // Bandingkan password yang dimasukkan dengan password di database
    if (password !== user.password) {
      return res.status(401).send('Invalid credentials');
    }

    // Redirect ke halaman home setelah login berhasil
    res.redirect('/');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/', async (req, res) => {
    try {
      const sportsResponse = await fetch('https://api.apilayer.com/therundown/sports', {
        method: 'GET',
        headers: {
          'apikey': 'ZzBYperUhGluFc7s54slWYTX2ci4m41J',
        },
      });
      const sportsData = await sportsResponse.json();
  
      console.log('Sports Data:', sportsData); 
      console.log('Sports Array:', sportsData.sports);
  
      res.render('index', { sports: sportsData.sports });
    } catch (error) {
      console.error('Error fetching sports data:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/teams/:sportId', async (req, res) => {
    const sportId = req.params.sportId;
  
    try {
      const teamsResponse = await fetch(`https://api.apilayer.com/therundown/sports/${sportId}/teams`, {
        method: 'GET',
        headers: {
          'apikey': 'ZzBYperUhGluFc7s54slWYTX2ci4m41J',
        },
      });
      const teamsData = await teamsResponse.json();
  
      console.log('Teams Data:', teamsData);
  
      res.render('teams', { teams: teamsData });
    } catch (error) {
      console.error(`Error fetching teams data for sport ${sportId}:`, error);
      res.status(500).send('Internal Server Error');
    }
  });


  app.get('/login', (req, res) => {
    res.render('login');
  });
  
  app.get('/register', (req, res) => {
    res.render('register');
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
