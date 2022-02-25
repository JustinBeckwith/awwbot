import express from 'express';
import bodyParser from 'body-parser';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { AWW_COMMAND, INVITE_COMMAND } from './commands.js';
import * as config from './config.js';
import { getCuteUrl } from './reddit.js';

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
      config.publicKey
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

app.post('/', async (request, response) => {
  const message = request.body;
  console.log(message);
  if (message.type === InteractionType.PING) {
    console.log('Handling Ping request');
    response.json({
      type: InteractionResponseType.PONG,
    });
  } else if (message.type === InteractionType.APPLICATION_COMMAND) {
    switch (message.data.name.toLowerCase()) {
      case AWW_COMMAND.name.toLowerCase(): {
        const cuteUrl = await getCuteUrl();
        response.status(200).send({
          type: 4,
          data: {
            content: cuteUrl,
          },
        });
        break;
      }
      case INVITE_COMMAND.name.toLowerCase(): {
        const applicationId = config.applicationId;
        const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
        response.status(200).send({
          type: 4,
          data: {
            content: INVITE_URL,
            flags: 64,
          },
        });
        break;
      }
      default:
        console.error('Unknown Command');
        response.status(400).send({ error: 'Unknown Type' });
        break;
    }
  } else {
    console.error('Unknown Type');
    response.status(400).send({ error: 'Unknown Type' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
