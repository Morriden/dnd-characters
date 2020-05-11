const client = require('../lib/client');
// import our seed data:
const characters = require('./characters.js');
const usersData = require('./users.js');
const alignmentData = require('./alignment.js');

run();

async function run() {

  try {
    await client.connect();

    await Promise.all(
      alignmentData.map(alignment => {
        return client.query(`
            INSERT INTO alignment (alignment)
            VALUES ($1)
            RETURNING *;
        `,
        [alignment.alignment]);
      })
    );

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
                    INSERT INTO characters (name, level, alignment_id, is_alive, description, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [character.name, character.level, character.alignment_id, character.is_alive, character.description, user.id]);
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
