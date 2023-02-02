import joi from 'joi';

export const postInputPattern = joi.object().keys({
  title: joi.string().description('제목'),
  content: joi.string().description('내용'),
  updated: joi.number().description('0: 수정이 안된 최초 상태, 1: 수정됨'),
  imageUrl: joi.string().description('이미지URL이 undefind 문자열일 때'),
  location1: joi.string().description('시, 도'),
  location2: joi.string().description('시, 군, 구'),
  tag: joi.string().allow(null).description('해시태그'),
  category: joi.number().description('1 : 헬피, 2 : 헬퍼, 3 : 헬퍼스'),
  isDeadLine: joi.number().description('0 : 모집중, 1 : 마감'),
  createdAt: joi.date().description('작성일'),
  appointed: joi.date() || joi.string(),
});

export const postIdPattern = joi.number().integer().required().description('게시글번호');
