// Run: node tests/sim.test.mjs      (exits 1 on any failure)
import { runAll } from './sim-cases.js';
const results = runAll();
results.forEach(r => console.log(`${r.pass ? 'ok  ' : 'FAIL'} ${r.name}${r.pass ? '' : '\n     ' + r.error}`));
const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
