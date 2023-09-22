const fetch = require('fetch');

function getHostIPAddress() {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
    exec('hostname -I', (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(new Error(stderr));
        return;
      }

      resolve(stdout.trim().split(" ")[0]);
    });
  });
}

module.exports = getHostIPAddress;
