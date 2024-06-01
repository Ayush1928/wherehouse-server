const express = require("express");
const process = require("process");
const { google } = require("googleapis");
const spreadsheetId = "1AoogFvO4OdcEbz-g7fmCD1Yy8kPad47ghRRVC2bZalY";
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//Middlewares
app.use(cors());
app.use(express.json());

const credentials = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function readSheet() {
  const sheets = google.sheets({ version: "v4", auth });
  const range = "Sheet1!A:C"; // Range to read.

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values;
    return rows;
  } catch (error) {
    console.error("error", error);
  }
}

async function writeToSheet(values) {
  const sheets = google.sheets({ version: "v4", auth });
  const range = "Sheet1";
  const valueInputOption = "USER_ENTERED";

  try {
    // Get the current data in the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Find the index of the first empty row
    const nextRow = response.data.values ? response.data.values.length + 1 : 1;

    const updatedRange = `Sheet1!A${nextRow}`;

    const resource = { values };

    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updatedRange,
      valueInputOption,
      resource,
    });

    return res;
  } catch (error) {
    console.error("error", error);
  }
}

app.get("/api/readSheet", async (req, res) => {
  try {
    const data = await readSheet();
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/writeToSheet", async (req, res) => {
  try {
    const sheetData = req.body.sheetData;
    const data = await writeToSheet(sheetData);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log("Listening on port : ", port);
});
