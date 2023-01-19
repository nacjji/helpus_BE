import { Request } from 'express';
import * as multer from 'multer';
import { nanoid } from 'nanoid';
import * as multers3 from 'multer-s3';
import s3 from '../config/AWS.s3';

const multeruploader = multer({
  storage: multers3({
    s3,
    bucket: process.env.S3_BUCKET_NAME as string,
    acl: 'public-read',
    contentType: (req, file, callback) => {
      callback(null, `image/${file.mimetype.split('/')[1]}`);
    },
    key(req, file, callback) {
      const fileType = file.mimetype.split('/')[1];
      callback(null, `helpus/${nanoid()}.${fileType}`);
    },
  }),

  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const fileType = file.mimetype.split('/')[0];
    if (fileType === 'image') {
      callback(null, true);
    } else {
      callback(new Error('이미지 형식이 아님'));
    }
  },
});

const profileUploader = multer({
  storage: multers3({
    s3,
    bucket: process.env.S3_BUCKET_NAME as string,
    acl: 'public-read',
    contentType: (req, file, callback) => {
      callback(null, `image/${file.mimetype.split('/')[1]}`);
    },
    key(req, file, callback) {
      const fileType = file.mimetype.split('/')[1];
      callback(null, `helpus/profile/${nanoid()}.${fileType}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const fileType = file.mimetype.split('/')[0];
    if (fileType === 'image') {
      callback(null, true);
    } else {
      callback(new Error('이미지 형식이 아님'));
    }
  },
});

const deleteS3Image = (profileImage: string) => {
  s3.deleteObject({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: `helpus/profile/${profileImage}`,
  });
};

const deleteS3ImagePost = (imageUrl1: string, imageUrl2: string, imageUrl3: string) => {
  s3.deleteObject({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: `helpus/${{ imageUrl1, imageUrl2, imageUrl3 }}`,
  });
};

export { multeruploader, profileUploader, deleteS3Image, deleteS3ImagePost };
