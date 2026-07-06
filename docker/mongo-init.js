db = db.getSiblingDB('jikan');
db.createUser({
  user: 'jikan',
  pwd: 'jikan_password',
  roles: [{ role: 'readWrite', db: 'jikan' }],
});
