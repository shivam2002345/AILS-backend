const { BlobServiceClient } = require('@azure/storage-blob');

const connectionString = "DefaultEndpointsProtocol=https;AccountName=ailswebsite;AccountKey=plrus5nsmiq3XoGdgCkovpRNiDd3rVVZAwihqR963frvnKLosUWSdiEMlqzFr32cbQsn92aWi6An+AStNehSzQ==;EndpointSuffix=core.windows.net";
const containerName = "course-assets"; // You can change this to your preferred container name

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

async function uploadToBlobStorage(file, folder = '') {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Create container if it doesn't exist
        await containerClient.createIfNotExists({ access: 'blob' });
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        const blobName = folder ? `${folder}/${uniqueSuffix}.${extension}` : `${uniqueSuffix}.${extension}`;
        
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype }
        });
        
        return blockBlobClient.url;
    } catch (error) {
        console.error('Error uploading to Azure Blob:', error);
        throw error;
    }
}

async function deleteFromBlobStorage(url) {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = url.split(`${containerName}/`)[1];
        
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();
    } catch (error) {
        console.error('Error deleting from Azure Blob:', error);
        throw error;
    }
}

module.exports = {
    uploadToBlobStorage,
    deleteFromBlobStorage
};