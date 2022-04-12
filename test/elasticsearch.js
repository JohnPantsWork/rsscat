require('dotenv').config();
const { ELASTIC_NODE, ELASTIC_NAME, ELASTIC_PASSWORD } = process.env;
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');

const client = new Client({
  node: ELASTIC_NODE,
  auth: {
    username: ELASTIC_NAME,
    password: ELASTIC_PASSWORD,
  },
  tls: {
    ca: fs.readFileSync('./http_ca.crt'),
    rejectUnauthorized: false,
  },
});

async function a() {
  const result = await client.search({
    index: 'index',
    query: {
      match: { name: 'aming' },
    },
  });
  console.log(`#result#`, result);
}
a();
