const config = require('./config.js');
const https = require('https');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const Twit = require('twit');
const T = new Twit({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token: config.access_token,
  access_token_secret: config.access_token_secret,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});

client.on("ready", () => {
  console.log(`ready!`);
});

client.on('message', (message) => {
  if (message.guild) {
    if (message.channel.id == config.channelID) {
      if (message.attachments) {
        console.log(message.attachments);
        let file = fs.createWriteStream(`./images/${message.attachments.first().filename}`);
        let request = https.get(message.attachments.first().url, function(response) {
          response.pipe(file);
        });
        setTimeout(function() {
          T.post('media/upload', {
            media_data: fs.readFileSync(`./images/${message.attachments.first().filename}`, {
              encoding: 'base64'
            })
          }, function(err, data, response) {
            console.log(data);
            // now we can assign alt text to the media, for use by screen readers and
            // other text-based presentations and interpreters
            var mediaIdStr = data.media_id_string;
            var altText = "Success";
            var meta_params = {
              media_id: mediaIdStr,
              alt_text: {
                text: altText
              }
            };

            T.post('media/metadata/create', meta_params, function(err, data, response) {
              if (!err) {
                // now we can reference the media and post a tweet (media will attach to the tweet)
                var params = {
                  status: `Success by - ${message.author.username}`,
                  media_ids: [mediaIdStr]
                };

                T.post('statuses/update', params, function(err, data, response) {
                  console.log(data);
                });
              }
            });
          });
        }, 3000);

      }
    }
  }
});

client.login(config.token);
