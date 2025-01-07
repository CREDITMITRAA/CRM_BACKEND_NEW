const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");
const { S3_BUCKET_NAME } = require("../utilities/constants");

const s3 = new AWS.S3();

// const upload = multer({ dest: "uploads/" });

async function uploadFile(req, res) {
  try {
    const file = req.file;
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `${Date.now()}-${path.basename(file.originalname)}`, // Unique key
      Body: fs.createReadStream(file.path),
    };
    const data = await s3.upload(params).promise();
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${file.path}`, err);
      } else {
        console.log(`Successfully deleted file: ${file.path}`);
      }
    });
    return ApiResponse(
      res,
      "success",
      201,
      "File Uploaded successfully !",
      data,
      null,
      null
    );
  } catch (error) {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${file.path}`, err);
      } else {
        console.log(`Successfully deleted file: ${file.path}`);
      }
    });
    return ApiResponse(
      res,
      "error",
      500,
      "Failed to upload file !",
      null,
      error,
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
