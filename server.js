require('dotenv').config();

const client = require('./lib/client');

// Initiate database connection
client.connect();

const app = require('./lib/app');
const PORT = process.env.PORT || 7890;

app.get('/alignment', async(req, res) => {
  const data = await client.query('SELECT * FROM alignment');

  res.json(data.rows);
});

app.get('/characters', async(req, res) => {
  const data = await client.query(`
      SELECT characters.id, characters.name, characters.level, alignment.alignment, characters.is_alive, characters.description
      from characters
      join alignment
      on characters.alignment_id = alignment.id
    `);

  res.json(data.rows);
});

app.get('/characters/:id', async(req, res) => {
  const data = await client.query(`
    SELECT characters.id, characters.name, characters.level, alignment.alignment, characters.is_alive, characters.description
    from characters
    join alignment
    on characters.alignment_id = alignment.id
    WHERE character.id=$1
    `, [req.params.id]
  );

  res.json(data.rows);
});

app.post('/characters', async(req, res) => {
  console.log(req.body);
  const data = await client.query(
    `insert into characters (name, level, alignment, is_alive, description, owner_id)
    values ($1, $2, $3, $4, $5, $6)
    returning *`,
    [req.body.name, req.body.level, req.body.alignment, req.body.is_alive, req.body.description, 1]
  );
  res.json(data.rows[0]);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});

module.exports = app;
