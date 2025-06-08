const bcrypt = require('bcrypt');

const newPassword = 'shivam123'; // Replace with the actual password
const saltRounds = 10;

bcrypt.hash(newPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashed Password:', hash);
});
