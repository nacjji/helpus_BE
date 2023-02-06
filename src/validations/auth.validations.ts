import joi from 'joi';

export const signupPattern = joi.object().keys({
  email: joi.string().email().required().description('이메일'),
  userName: joi
    .string()
    .regex(/^[\w\W]{1,20}$/)
    .required()
    .description('사용자 닉네임'),
  password: [
    joi
      .string()
      .regex(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/)

      .required()
      .description('비밀번호'),
  ],
  state1: joi.string().required().description('기본 주소지'),
  state2: joi.string().required().description('상세 기본 주소지'),
  profileImage: joi.string().allow('').description('프로필 이미지'),
});

export const emailPattern = joi.object().keys({
  email: joi.string().email().required(),
});

export const loginPattenrn = joi.object().keys({
  email: joi.string().email().required(),
  password: joi.string().min(4).max(20).required(),
});

export const updatePattern = joi.object().keys({
  userName: joi
    .string()
    .regex(/^[\w\W]{1,20}$/)
    .required()
    .description('사용자 닉네임'),
  state1: joi.string().required().description('기본 주소지'),
  state2: joi.string().required().description('상세 기본 주소지'),
});

export const scorePattern = joi.object().keys({
  score: joi.string().required(),
});
