import { Request } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import multers3 from 'multer-s3';
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
      // 중복되는 이미지 이름을 피하기 위해 nanoId 라이브러리 사용
      callback(null, `helpus/${nanoid()}.${fileType}`);
    },
  }),

  // 최대 파일 용량 20MB
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

const chatUploader = multer({
  storage: multers3({
    s3,
    bucket: process.env.S3_BUCKET_NAME as string,
    acl: 'public-read',
    contentType: (req, file, callback) => {
      callback(null, `image/${file.mimetype.split('/')[1]}`);
    },
    key(req, file, callback) {
      const fileType = file.mimetype.split('/')[1];
      callback(null, `helpus/chat/${nanoid()}.${fileType}`);
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

// 게시글 이미지 삭제
const deleteS3ImagePost = (imageUrls: any) => {
  // 이미지 이름만을 추출해 "[{Key : URL} .. ]" 형식으로 생성됨
  const deleteImgs = imageUrls.map((v: string) => {
    return { Key: `helpus/${v}` };
  });
  s3.deleteObjects({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Delete: {
      Objects: deleteImgs,
    },
  });
};

const deleteS3ImageChat = (imageUrls: any[]) => {
  const deleteImgs = imageUrls.map((v: { content: string }) => {
    return { Key: v.content.split('.com/')[1] };
  });

  s3.deleteObjects({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Delete: {
      Objects: deleteImgs,
    },
  });
};

export {
  multeruploader,
  profileUploader,
  chatUploader,
  deleteS3Image,
  deleteS3ImagePost,
  deleteS3ImageChat,
};
