const bcrypt = require('bcryptjs');

async function generateHash() {
  const hash = await bcrypt.hash('123456', 10);
  console.log('123456的bcrypt哈希:', hash);
  
  // 验证
  const isValid = await bcrypt.compare('123456', hash);
  console.log('验证结果:', isValid);
}

generateHash();