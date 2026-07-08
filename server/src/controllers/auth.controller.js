const { readDB } = require('../models');

exports.login = (req, res) => {
  const { email, password } = req.body;
  const { users } = readDB();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
  res.json({ message: 'Login pendiente de implementar', user });
};
