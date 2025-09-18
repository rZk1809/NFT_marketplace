const axios = require('axios');

async function checkAPI() {
  try {
    const response = await axios.get('http://localhost:3002/api/nft/available');
    console.log('Full response data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data.nfts.length > 0) {
      console.log('\nFirst NFT structure:');
      console.log(JSON.stringify(response.data.data.nfts[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAPI();