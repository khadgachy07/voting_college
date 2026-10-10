import mysql from 'mysql2/promise';

const pool = mysql.createPool({host:'localhost',port:3306,user:'root',password:'password',database:'voting_college'});
try {
  const [cols] = await pool.query('DESCRIBE students');
  console.log('students columns:', JSON.stringify(cols.map(c => c.Field)));
  const [rows] = await pool.query('SELECT * FROM students LIMIT 5');
  console.log('sample rows:', JSON.stringify(rows));
} finally {
  await pool.end();
}
