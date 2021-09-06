const express = require('express');
const joi = require('@hapi/joi');
const joiPhoneNumber = require('joi-phone-number');

const {
  errorHandler,
  requestValidator,
  ResponseError,
  authorize,
} = require('./middleware');
const {
  UserNotFoundError,
  DuplicateEmailError,
  AuthenticationError,
} = require('../../db-handlers/user/errors');
const helpers = require('../../lib/helpers');
const schema = require('../schema');
const userDbHandler = require('../../db-handlers/user');
const userServiceHandler = require('../../service-handlers/user');

const phoneValidator = joi.extend(joiPhoneNumber);

const usersRouter = () => {
  const router = express();
  
  router.post(
    '/v1/users/mobile-phone',
    requestValidator('body', schema.userMobilePhoneBody),
    async (req, res, next) => {
      try {
        const { ip } = req;
        const formattedNumber = phoneValidator
          .string()
          .phoneNumber({ defaultCountry: 'ZA', format: 'international' })
          .validate(req.body.mobilePhone);
        await userServiceHandler.mobilePhone(formattedNumber.value, ip);
        return res.json({});
      } catch (error) {
        return next(error);
      }
    },
  );

  router.post(
    '/v1/users/register',
    requestValidator('body', schema.userRegisterBody),
    async (req, res, next) => {
      try {
        const { ip } = req;
        const response = await userServiceHandler.register(req.body, ip);
        return res.json(response);
      } catch (error) {
        if (error instanceof DuplicateEmailError) {
          return next(new ResponseError(403, error.message));
        }
        return next(error);
      }
    },
  );

  router.post(
    '/v1/users/auth',
    requestValidator('body', schema.userAuthBody),
    async (req, res, next) => {
      try {
        const { ip } = req;
        const response = await userServiceHandler.auth(req.body, ip);
        return res.json(response);
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return next(new ResponseError(403, error.message));
        }
        if (error instanceof UserNotFoundError) {
          return next(new ResponseError(403, error.message));
        }
        return next(error);
      }
    },
  );

  router.post(
    '/v1/users/refresh-token',
    async (req, res, next) => {
      try {
        const { ip, cookies } = req;
        const { refreshToken } = cookies;
        
        if (!refreshToken) return res.status(400).json({ message: 'Token is required' });

        const { token, ...user } = await userServiceHandler.refreshToken(refreshToken, ip);
        helpers.setTokenCookie(res, token);
        return res.json(user);
      } catch (error) {
        if (error instanceof CodeVerificationError) {
          return next(new ResponseError(403, error.message));
        }
        return next(error);
      }
    },
  );

  router.post(
    '/v1/users/revoke-token',
    authorize,
    async (req, res, next) => {
      try {
        // accept token from request body or cookie
        const { ip, body, cookies } = req;
        const token = body.token || cookies.refreshToken;

        if (!token) return res.status(400).json({ message: 'Token is required' });

        // users can revoke their own tokens and admins can revoke any tokens
        if (!req.user.ownsToken(token) /*&& req.user.role !== Role.Admin*/) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        await userServiceHandler.revokeToken(token, ip);
        return res.json({});
      } catch (error) {
        return next(error);
      }
    },
  );

  router.put(
    '/v1/users/profile',
    authorize,
    requestValidator('body', schema.userUpdateProfileBody),
    async (req, res, next) => {
      try {
        const formattedNumber = phoneValidator
          .string()
          .phoneNumber({ defaultCountry: 'ZA', format: 'international' })
          .validate(req.body.mobileNumber);
        await userServiceHandler.updateProfile(
          req.user, 
          {
            ...req.body,
            mobileNumber: formattedNumber.value,
          },
        );
        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return next(new ResponseError(404, error.message));
        }
        return next(error);
      }
    },
  );

  router.get(
    '/v1/users/authorized',
    authorize,
    async (req, res, next) => {
      try {
        const { user } = req;
        return res.json(user);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return next(new ResponseError(404, error.message));
        }
        return next(error);
      }
    },
  );

  router.get(
    '/v1/users/:id',
    requestValidator('params', schema.userGetByIdParamsSchema),
    async (req, res, next) => {
      try {
        const user = await userDbHandler.getById(req.params.id);
        return res.json(user);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return next(new ResponseError(404, error.message));
        }
        return next(error);
      }
    },
  );

  router.get(
    '/v1/users',
    async (req, res, next) => {
      try {
        const users = await userDbHandler.getAll(req.params.id);
        return res.json(users);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.delete(
    '/v1/users/:id',
    requestValidator('params', schema.userDeleteParamsSchema),
    async (req, res, next) => {
      try {
        await userDbHandler.deactivate(req.params.id);
        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return next(new ResponseError(404, error.message));
        }
        return next(error);
      }
    },
  );

  router.use(errorHandler);

  return router;
};

module.exports = usersRouter;
