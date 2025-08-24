import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL || "postgresql://neondb_owner:npg_rvbDAJhG34QI@ep-frosty-glitter-a1d0r5ld-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
export const db = drizzle(sql, { schema });
