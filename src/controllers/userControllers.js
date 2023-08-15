const usermodel = require('../models/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { Pool } = require('pg');
const SECRET_KEY = "NOTEAPI";

const signup = async(req,res)=>{
        const {username, email, password} = req.body;
        try {
            const existingUser = await usermodel.findOne({ email: email}); 
            if(existingUser){
                return res.status(400).json({message: "User already exists"});
            }
            const hashedPassword = await bcrypt.hash(password, 10); 
            const result = await usermodel.create({
                email: email,
                password: hashedPassword,
                username: username
            });
        
        const token = jwt.sign ({email: result.email, id: result._id}, SECRET_KEY); 
        res.status(201).json({user: result, token: token});
        
        } catch (error) {
            console.log(error); 
            res.status(500).json({message: "Something went wrong"});
        }
    }

const signin = async(req,res)=>{
        const {email, password} = req.body;
        try {
            const existingUser = await usermodel.findOne({ email: email});
            if(! existingUser){
                return res.status(404).json({message: "User not found"});
            }
            const matchPassword = await bcrypt.compare(password, existingUser.password);
            if(! matchPassword){ 
                return res.status(400).json({message: "Invalid Credentials"});
            }
            const token = jwt.sign({email: existingUser.email, id:existingUser._id }, SECRET_KEY);
            res.status(201).json({user: existingUser, token: token}); I       
        } catch (error){
            console.log(error);
            res.status(500).json({message: "Something went wrong"});
        }
}

// PostgreSQL database configuration
const pool = new Pool({
    user: 'your_db_user',
    host: 'your_db_host',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432, // Default PostgreSQL port
  });



// Define a route for the POST API
const scrape = async (req, res) => {
  const { url, userId } = req.body; // Assuming userId is provided in the request

  if (!url || !userId) {
    return res.status(400).json({ error: 'URL and userId are required' });
  }

  // TODO: Check if the user is logged in and handle accordingly

  try {
    // Check if the URL already exists for the logged-in user
    const existingUrlQuery = `
      SELECT id FROM scraped_data
      WHERE user_id = $1 AND url = $2
    `;
    const existingUrlValues = [userId, url];
    const existingUrlResult = await pool.query(existingUrlQuery, existingUrlValues);

    if (existingUrlResult.rowCount > 0) {
      // URL already exists, return data from the database
      const existingDataQuery = `
        SELECT * FROM scraped_data
        WHERE user_id = $1 AND url = $2
      `;
      const existingDataValues = [userId, url];
      const existingDataResult = await pool.query(existingDataQuery, existingDataValues);

      return res.json({ data: existingDataResult.rows });
    }

    // URL doesn't exist, scrape and save data
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // TODO: Extract the desired fields using Cheerio
    const title = $('title').text();
    // Extract other fields similarly

    // Save the extracted data to PostgreSQL
    const insertQuery = `
      INSERT INTO scraped_data (user_id, title, url)
      VALUES ($1, $2, $3)
    `;
    const insertValues = [userId, title, url];

    await pool.query(insertQuery, insertValues);

    return res.json({ message: 'Data scraped and saved successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
};


module.exports =  {signup,signin, scrape};