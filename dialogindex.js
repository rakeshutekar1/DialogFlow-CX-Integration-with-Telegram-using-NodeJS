require('dotenv').config()
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')


const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}` // setting up webhook to create a server
const WEBHOOK_URL = SERVER_URL + URI

const app = express()
app.use(Routes);
app.use(bodyParser.json())

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data)
}

const projectId = 'enter your project Id';
const location = 'global'; //ypur agent should be on GLOBAl only
const agentId = 'enter yout agent Id';
// const query = ''; // you can use this if you want but i have passed using another methode you can see it below
const languageCode = 'en'

// Imports the Google Cloud Some API library
const {SessionsClient} = require('@google-cloud/dialogflow-cx'); // download this library using NPM
/**
 * Example for regional endpoint:
 *   const location = 'us-central1'
 *   const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})
 */
const client = new SessionsClient();

async function detectIntentText() {
  const sessionId = Math.random().toString(36).substring(7);
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );
  console.info(sessionPath);
  
  app.post(URI, async (req, res) => {
    console.log(req.body) 

    const chatId = req.body.message.chat.id
    const ttx = req.body.message.text


    const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: ttx,
          },
          languageCode,
        },
      };

      const [response] = await client.detectIntent(request);

  for (const message of response.queryResult.responseMessages) {
    if (message.text) {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: message.text.text[0],
        })
        console.log(`Agent Response: ${message.text.text}`,)
    }
    if (response.queryResult.match.intent) {
        console.log(
          `Matched Intent: ${response.queryResult.match.intent.displayName}`
        );
      }
      console.log(
        `Current Page: ${response.queryResult.currentPage.displayName}`
      );

    }
    return res.send()
   } )
  }

detectIntentText();

app.listen(process.env.PORT || 5000, async () => {
    console.log('app running on port', process.env.PORT || 5000)
    await init()
})
    
