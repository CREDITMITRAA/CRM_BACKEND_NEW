const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");
const { S3_BUCKET_NAME } = require("../utilities/constants");
const { sequelize } = require("../models");
const { addLeadDocument } = require("../services/leadDocumentServices");

const s3 = new AWS.S3();

// const upload = multer({ dest: "uploads/" });

async function uploadFile(req, res) {
  const transaction = await sequelize.transaction();
  const file = req.file;

  try {
    if (!file) {
      throw new Error("No file provided.");
    }

    // Generate unique key for the S3 object
    const uniqueKey = `${Date.now()}-${path.basename(file.originalname)}`;

    const params = {
      Bucket: S3_BUCKET_NAME, // Ensure this is properly set in your environment
      Key: uniqueKey,
      Body: fs.createReadStream(file.path),
    };

    // Upload file to S3
    const data = await s3.upload(params).promise();

    // Delete local file only if it exists
    if (fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Failed to delete local file: ${file.path}`, err);
        } else {
          console.log(`Successfully deleted local file: ${file.path}`);
        }
      });
    }

    // Prepare database record
    const leadDocumentData = {
      lead_id: req.body.lead_id, // Assuming `lead_id` comes in the request body
      document_url: data.Location, // S3 file URL
      document_type: req.body.document_type || file.mimetype, // Optional field from request or file type
      document_name: file.originalname,
      status: "active", // Default status
    };

    // Save the record in the database
    await addLeadDocument(leadDocumentData, transaction);

    // Commit the transaction
    await transaction.commit();

    // Return success response
    return ApiResponse(
      res,
      "success",
      201,
      "File Uploaded successfully!",
      { fileData: data, dbData: leadDocumentData },
      null,
      null
    );
  } catch (error) {
    // Rollback the transaction
    await transaction.rollback();

    // Ensure local file is deleted if it exists
    if (fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Failed to delete local file during error handling: ${file.path}`, err);
        } else {
          console.log(`Successfully deleted local file during error handling: ${file.path}`);
        }
      });
    }

    // Log detailed error for debugging
    console.error("Error during file upload:", error);

    // Return error response
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to upload file!",
      null,
      error.message,
      null
    );
  }
}

async function uploadMultipleFiles(req, res) {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return ApiResponse(res, "error", 400, "Files are required !");
    }

    const uploadResults = [];
    for (const file of files) {
      // Configure the S3 parameters for each file
      const params = {
        Bucket: S3_BUCKET_NAME, // Replace with your bucket name
        Key: `${Date.now()}-${path.basename(file.originalname)}`, // Unique key
        Body: fs.createReadStream(file.path),
      };

      const data = await s3.upload(params).promise();
      uploadResults.push(data);
      // Remove the file from the temporary directory
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${file.path}`, err);
        } else {
          console.log(`Successfully deleted file: ${file.path}`);
        }
      });
    }

    return ApiResponse(
      res,
      "success",
      201,
      "Files uploaded successfully !",
      uploadResults,
      null,
      null
    );
  } catch (error) {
    // Ensure all files are removed even in case of an error
    for (const file of files) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${file.path}`, err);
        }
      });
    }
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to Upload Files !",
      null,
      error,
      null
    );
  }
}

module.exports = {
  uploadFile,
  uploadMultipleFiles
};
