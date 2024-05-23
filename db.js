import "dotenv/config";
import pgPromise from "pg-promise";

const pgp = pgPromise();
const db = pgp(process.env.DB_URI);

export default db;
