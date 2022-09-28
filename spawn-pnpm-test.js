const spawn = require('child_process').spawn;
const child = spawn('pnpm', ['install'], {
  cwd: '/Users/raine/projects/nest-api-example',
});
let stderr = '';
let stdout = '';

child.stdout.on('data', (data) => (stdout += data));
child.stderr.on('data', (data) => (stderr += data));
child.on('close', (code) => {
  console.info('Return code', code);
  console.error('STDERR:', stderr);
  console.log('STDOUT:', stdout);
});
