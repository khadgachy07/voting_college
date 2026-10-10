import mysql from 'mysql2/promise';

const pool = mysql.createPool({host:'localhost',port:3306,user:'root',password:'password',database:'voting_college'});
try {
  const [users] = await pool.query('SELECT COUNT(*) as c FROM users');
  const [students] = await pool.query('SELECT COUNT(*) as c FROM students');
  const [candidates] = await pool.query('SELECT COUNT(*) as c FROM candidates');
  const [positions] = await pool.query('SELECT COUNT(*) as c FROM positions');
  console.log('users:', users[0].c, 'students:', students[0].c, 'candidates:', candidates[0].c, 'positions:', positions[0].c);
} finally {
  await pool.end();
}
