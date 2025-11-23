import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';
import open from 'open';
import "dotenv/config";

const CLIENT_ID = "1080702423460-89tjsnntrapbusgopgdbomrda8a4up72.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('🔗 Abre esta URL en tu navegador:\n');
console.log(authUrl);
console.log('\n');

// Crear servidor temporal
const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/oauth2callback')) {
    const qs = new URL(req.url, 'http://localhost:3000').searchParams;
    const code = qs.get('code');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>✅ Autorización completa!</h1>
          <p>Revisa la terminal para obtener tu REFRESH_TOKEN</p>
        </body>
      </html>
    `);

    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('\n✅ ¡Tokens obtenidos!\n');
      console.log('📋 Copia estos valores a tu .env:\n');
      console.log(`YOUTUBE_CLIENT_ID="${CLIENT_ID}"`);
      console.log(`YOUTUBE_CLIENT_SECRET="${CLIENT_SECRET}"`);
      console.log(`YOUTUBE_REFRESH_TOKEN="${tokens.refresh_token}"`);
      console.log('\n');

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    } catch (error) {
      console.error('❌ Error obteniendo tokens:', error);
      server.close();
      process.exit(1);
    }
  }
});

server.listen(3000, () => {
  console.log('🚀 Servidor OAuth temporal corriendo en http://localhost:3000');
  open(authUrl);
});