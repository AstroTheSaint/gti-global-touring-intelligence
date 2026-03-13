import Database from "better-sqlite3";
const db = new Database("gti.db");
console.log(db.prepare("SELECT * FROM artists").all());
console.log(db.prepare("SELECT * FROM tours").all());
console.log(db.prepare("SELECT * FROM shows").all());
