const {PrismaClient} = require('@prisma/client');
const db = new PrismaClient();
const fn = db[''].bind(db);
fn("SELECT column_name FROM information_schema.columns WHERE table_name='company' ORDER BY ordinal_position")
  .then(r => { console.log(r.map(x => x.column_name).join('\n')); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
