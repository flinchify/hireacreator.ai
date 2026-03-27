import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require');
const rows = await sql`SELECT slug, link_bio_template, link_bio_bg_type FROM users WHERE slug = 'milesrunsai'`;
console.log(JSON.stringify(rows, null, 2));
