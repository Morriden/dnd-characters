const client = require('../lib/client');
// import our seed data:
const characters = require('./characters.js');
const usersData = require('./users.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      characters.map(character => {
        return client.query(`
                    INSERT INTO characters (name, level, alignment, is_alive, description, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [character.name, character.level, character.alignment, character.is_alive, character.description, user.id]);
      })
    );
    

    console.log('seed data load complete');
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
