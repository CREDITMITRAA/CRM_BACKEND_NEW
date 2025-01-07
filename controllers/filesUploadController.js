const AWS = require("aws-sdk");
const fs = require('fs')
const path = require("path");
const { ApiResponse } = require("../utilities/api-responses/ApiResponse");

const s3 = new AWS.S3();

// const upload = multer({ dest: "uploads/" });

async function uploadFile(req, res) {
  try {
    const file = req.file;
    const params = {
      Bucket: "crm-creditmitra",
      Key: `${Date.now()}-${path.basename(file.originalname)}`, // Unique key
      Body: fs.createReadStream(file.path),
    };
    const data = await s3.upload(params).promise()
    fs.unlink(file.path, (err) => {
        if (err) {
            console.error(`Failed to delete file: ${file.path}`, err);
        } else {
            console.log(`Successfully deleted file: ${file.path}`);
        }
    });
    return ApiResponse(res, 'success', 201, "File Uploaded successfully !", data, null, null)
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

module.exports = {
    uploadFile
};
