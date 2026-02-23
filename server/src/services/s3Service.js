const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, S3_BUCKET } = require('../config/s3');
const path = require('path');
const crypto = require('crypto');

// Default signed URL expiry: 1 hour
const SIGNED_URL_EXPIRES_IN = 3600;

/**
 * Upload a buffer to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalName - Original file name
 * @param {string} folder - S3 folder prefix (e.g., 'profile-photos', 'signatures')
 * @param {string} mimetype - File MIME type
 * @returns {string} The S3 object key (NOT a full URL)
 */
const uploadToS3 = async (fileBuffer, originalName, folder, mimetype) => {
    const ext = path.extname(originalName);
    const key = `${folder}/${crypto.randomUUID()}${ext}`;

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
    });

    await s3Client.send(command);

    return key;
};

/**
 * Generate a presigned URL for a private S3 object
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - Expiry in seconds (default 1 hour)
 * @returns {string|null} Presigned URL or null if key is empty
 */
const getPresignedUrl = async (key, expiresIn = SIGNED_URL_EXPIRES_IN) => {
    if (!key) return null;

    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Delete a file from S3 by its key
 * @param {string} key - The S3 object key (or legacy full URL)
 */
const deleteFromS3 = async (key) => {
    if (!key) return;
    try {
        // Support legacy full URLs: extract key from URL
        let s3Key = key;
        if (key.startsWith('http')) {
            const url = new URL(key);
            s3Key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
        }

        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
        });

        await s3Client.send(command);
    } catch (err) {
        console.error('S3 delete error:', err.message);
    }
};

module.exports = { uploadToS3, deleteFromS3, getPresignedUrl };
