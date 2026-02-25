const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("123", 10);
  console.log(hash);
})();