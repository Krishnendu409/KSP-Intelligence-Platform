const db = require('better-sqlite3')('C:/Users/krish/Documents/DATATHON/frontend/data/fir_system.sqlite');
console.log(db.prepare('SELECT DistrictID, COUNT(*) FROM Unit GROUP BY DistrictID').all());
