console.log('app running...');

const dotenv = require('dotenv').config()
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const {
    Configuration,
    OpenAIApi
} = require("openai");
const fsPromises = fs.promises;
const {
    google
} = require('googleapis');

const port = process.env.PORT || 1111;
const app = express();
const server = app.listen(port, () => console.log(`listening @ ${port} --> http://localhost:${port}`));
app.use(express.static('public'));
app.use(express.json({
    limit: '2mb'
}));
app.use(cors());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const max = 26;

app.get('/api', async(request, response) => {

    console.log('resquest...');

    let subs = await new ReadEmail('_dominio').getSpam();

    // console.log(subs[getRandomInt(0, 26)])

    const prompt = subs[getRandomInt(0, max)];

    try {
        const data = await generateImageRequest(prompt);
        response.json({
            'status': 'success',
            'image': data,
            'prompt': prompt
        });
        console.log('prompt:', prompt);

    } catch (err) {
        console.log('llegaste al limite de búsquedas, esperá un momento...');
        console.log(err)
        response.json({
            'status': 'error',
            'image': null,
            'prompt': prompt
        });
    };

    console.log('response sent');
});

let generateImageRequest = async prompt => {

    console.log('generating image...');

    const response = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "512x512",
        response_format: 'url'
    });

    // downloadFile(response.data.data[0].url);
    let image_url = response.data.data;
    return image_url;
};

class ReadEmail {
    constructor() {
        this.auth = null;
        this.message = null;
    };

    async getSpam() {
        this.auth = await this.getAuthorize();
        this.message = await this.getLastMessage(max);
        return this.message
    };

    async getAuthorize() {
        const oAuth2Client = await new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URIS,
        );

        await oAuth2Client.setCredentials({
            type: process.env.TYPE,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            refresh_token: process.env.REFRESH_TOKEN
        });

        return oAuth2Client;
    };

    async getLastMessage(max) {
        let subjects = []
        const gmail = await google.gmail({
            version: 'v1',
            auth: this.auth
        });
        var request = await gmail.users.messages.list({
            userId: 'me',
            labelIds: 'SPAM',
            maxResults: max,
        });

        for (let i = 0; i <= max - 1; i++) {

            let id = request.data.messages[i].id;
            var request2 = await gmail.users.messages.get({
                userId: 'me',
                id: id,
            });
            let msg = request2.data.snippet;
            subjects.push(msg);
        };
        return subjects;
    };
};


const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const downloadFile = async(url) => {
    const response = await fetch(url);
    const buffer = await response.buffer();
    console.log(buffer)
    fs.writeFile(`./image.jpg`, buffer, () =>
        console.log('finished downloading!'));
};