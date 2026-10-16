const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectsCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const AppError = require('./appError');

let client;
let bucket;

const getR2 = () => {
  if (client && bucket) {
    return { client, bucket };
  }

  const {
    R2_ACCOUNT_ID,
    R2_BUCKET_NAME,
    R2_ENDPOINT,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY
  } = process.env;

  if (
    !R2_ACCOUNT_ID ||
    !R2_BUCKET_NAME ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY
  ) {
    throw new AppError('R2 storage is not configured', 500);
  }

  const endpoint =
    R2_ENDPOINT ||
    `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  if (
    endpoint !== `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  ) {
    throw new AppError('R2 endpoint does not match the configured account', 500);
  }

  client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY
    },
    forcePathStyle: true
  });
  bucket = R2_BUCKET_NAME;

  return { client, bucket };
};

exports.createUploadUrl = async (key, contentType) => {
  const { client, bucket } = getR2();
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    }),
    { expiresIn: 10 * 60 }
  );
};

exports.createReadUrl = async key => {
  const { client, bucket } = getR2();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 15 * 60 }
  );
};

exports.headObject = async key => {
  const { client, bucket } = getR2();
  return client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
};

exports.getObject = async key => {
  const { client, bucket } = getR2();
  return client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
};

exports.deleteObjects = async keys => {
  if (keys.length === 0) return;
  const { client, bucket } = getR2();

  for (let index = 0; index < keys.length; index += 1000) {
    const response = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: keys.slice(index, index + 1000).map(Key => ({ Key })),
          Quiet: false
        }
      })
    );

    if (response.Errors && response.Errors.length > 0) {
      throw new AppError('One or more order photos could not be deleted from R2', 502);
    }
  }
};
