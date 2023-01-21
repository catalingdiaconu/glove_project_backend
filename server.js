const express = require('express');
const cors = require('cors');

const { google } = require('googleapis')

const app = express();

const {
    REACT_APP_PRIVATE_KEY,
    REACT_APP_CLIENT_EMAIL,
    REACT_APP_SPREADSHEET_ID,
    REACT_APP_SHEET_ID
} = process.env



// Middleware

app.use(express.json())

app.use(
    cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}))

// End of middleware

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.post('/submit', async (req, res) => {
    const { request, name } = req.body;

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

app.listen(5000, () => {
    console.log('Server started on port 5000')
})