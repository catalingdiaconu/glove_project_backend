const express = require('express');
const cors = require('cors');

const { google } = require('googleapis')
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();

// Middleware

app.use(express.json())

app.use(
    cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}))

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'kata7299@gmail.com',
     pass: 'ovjpqfsflgeqxqdz'
    }
});

// End of middleware

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.post('/submit', async (req, res) => {

    const auth = new google.auth.GoogleAuth({
        keyFile: "./googleCredentials/credentials.json", //the key file
        //url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets", 
    });
    
    const authClientObject = await auth.getClient();

    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

    const spreadsheetId = '1BmTZLVchbKtdWldoBdMtVMYYYyLzfXXFZJhCLq-2lqU';

    await googleSheetsInstance.spreadsheets.values.append({
        auth, //auth object
        spreadsheetId, //spreadsheet id
        range: "Sheet1!A:L", //sheet name and range of cells
        valueInputOption: "USER_ENTERED", // The information will be passed according to what the usere passes in as date, number or text
        resource: {
            values: [req.body],
        }, 
    },  (err, response) => {
        if (err) return console.log(`The API returned an error: ${err}`)
        res.status(200).send({ message: 'Form data submitted successfully!' })
    });
})

app.post('/send-email', (req, res) => {
    // Get the email data from the request body
    const emailData = req.body;
  
    // Define the email options
    const mailOptions = {
      from: 'kata7299@gmail.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.message
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Email sent successfully' });
      }
    });
});

app.post("/postToken", async (req, res) => {
//Destructuring response token from request body
    const {token} = req.body;

//sends secret key and response token to google
    await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=6Lc1hx0kAAAAAP9Q8dRjLa6tnut21sxNSRfM0mL7&response=${token}`)
        .then(response => {
            if(response.data.success === true) {
                res.status(200).send({ message: 'reCaptcha verification worked' })
            } else {
                res.status(500).send({ message: 'reCaptcha verification worked' })
            }
        })
});

app.listen(5000, () => {
    console.log('Server started on port 5000')
})