const Webinar = require('../models/webinarModel');
const { uploadToBlobStorage, deleteFromBlobStorage } = require('../utils/azureBlob');

// Get all webinars
exports.getAllWebinars = async (req, res) => {
  try {
    const webinars = await Webinar.getAllWebinars();
    res.status(200).json({
      success: true,
      webinars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching webinars',
      error: error.message,
    });
  }
};

// Get a webinar by ID
exports.getWebinarById = async (req, res) => {
  const { id } = req.params;
  try {
    const webinar = await Webinar.getWebinarById(id);
    if (!webinar) {
      return res.status(404).json({ success: false, message: 'Webinar not found' });
    }
    res.status(200).json({ success: true, data: webinar });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching webinar',
      error: error.message,
    });
  }
};

// Create a new webinar
exports.createWebinar = async (req, res) => {
  try {
    const { title, description = '', launch_date, webinar_type, cost = 0 } = req.body;

    if (!title || !webinar_type) {
      return res.status(400).json({
        success: false,
        message: 'Title and webinar type are required.',
      });
    }

    let imageUrl = null;
    
    // Upload image to Azure Blob if file exists
    if (req.files?.image?.[0]) {
      imageUrl = await uploadToBlobStorage(req.files.image[0], 'webinar-images');
    }

    const webinarData = {
      title,
      description,
      launch_date: launch_date || null,
      webinar_type,
      cost: parseFloat(cost),
      image_url: imageUrl,
    };

    const webinar = await Webinar.createWebinar(webinarData);

    return res.status(201).json({
      success: true,
      message: 'Webinar created successfully',
      data: webinar,
    });
  } catch (error) {
    console.error('Error creating webinar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating webinar',
      error: error.message,
    });
  }
};

// Update an existing webinar
exports.updateWebinar = async (req, res) => {
  const { id } = req.params;

  try {
    // Get current webinar data first
    const currentWebinar = await Webinar.getWebinarById(id);
    if (!currentWebinar) {
      return res.status(404).json({ message: 'Webinar not found' });
    }

    const webinarData = req.body;
    let imageUrl = currentWebinar.image_url;

    // Update image if new one is uploaded
    if (req.files?.image?.[0]) {
      // Delete old image if exists
      if (currentWebinar.image_url) {
        await deleteFromBlobStorage(currentWebinar.image_url);
      }
      imageUrl = await uploadToBlobStorage(req.files.image[0], 'webinar-images');
      webinarData.image_url = imageUrl;
    }

    const updatedWebinar = await Webinar.updateWebinar(id, webinarData);
    res.status(200).json({
      success: true,
      message: 'Webinar updated successfully',
      data: updatedWebinar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating webinar',
      error: error.message,
    });
  }
};

// Delete a webinar by ID
exports.deleteWebinar = async (req, res) => {
  const { id } = req.params;

  try {
    // Get webinar data first to delete associated image
    const webinar = await Webinar.getWebinarById(id);
    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: 'Webinar not found',
      });
    }

    // Delete associated image from blob storage
    if (webinar.image_url) {
      await deleteFromBlobStorage(webinar.image_url);
    }

    await Webinar.deleteWebinar(id);
    res.status(200).json({
      success: true,
      message: 'Webinar deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting webinar',
      error: error.message,
    });
  }
};