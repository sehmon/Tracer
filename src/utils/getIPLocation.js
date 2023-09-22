const apiURL = 'http://ip-api.com/json/'

async function getIPLocation(ipAddress) {
  const response = await fetch(apiURL + ipAddress);
  const data = await response.json();
  return data;
}

module.exports = getIPLocation;
