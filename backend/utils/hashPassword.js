const bcrypt = require("bcrypt");

async function hash(){

 const password = "123";

 const hashed = await bcrypt.hash(
  password,
  10
 );

 console.log(hashed);

}

hash();