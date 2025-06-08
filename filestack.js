// Import the Filestack SDK
const filestack = require('filestack-js');

// Initialize the Filestack client with your API key
const client = filestack.init('A6fMJ1P8QVCrSDiLUNnvwz');

// Upload file from local server or handle file upload through a form
const uploadFile = async (filePath) => {
  try {
    const result = await client.upload(filePath);
    console.log('File uploaded successfully. File URL:', result.url);
    return result.url; // Return the file URL
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

module.exports = { uploadFile };
