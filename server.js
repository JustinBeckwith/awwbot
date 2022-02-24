import express from 'express';
import bodyParser from 'body-parser';
import nconf from 'nconf';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';

nconf.argv().env().file({ file: 'config.json' });
const publicKey = nconf.get('publicKey');

const app = express();
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use((request, response, next) => {
  if (request.method === 'POST') {
    const signature = request.headers['x-signature-ed25519'];
    const timestamp = request.headers['x-signature-timestamp'];
    const isValidRequest = verifyKey(
      request.rawBody,
      signature,
      timestamp,
      publicKey
    );
    if (!isValidRequest) {
      console.error('Invalid Request');
      return response.status(401).send({ error: 'Bad request signature' });
    }
  }
  next();
});

app.get('/', (req, res) => {
  console.log('sayin hello!');
  res.send('👋');
});

app.post('/', (request, response) => {
  const message = request.body;
  console.log(message);
  if (message.type === InteractionType.PING) {
    console.log('Handling Ping request');
    response.json({
      type: InteractionResponseType.PONG,
    });
  } else {
    console.error('Unknown Type');
    response.status(400).send({ error: 'Unknown Type' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
