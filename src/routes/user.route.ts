import express from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import { userValidation } from '../validations';
import { userController } from '../controllers';

const router = express.Router();

router
  .route('/:userId')
  .get(auth(), validate(userValidation.getUser), userController.getUser)
  .patch(auth(), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth(), validate(userValidation.deleteUser), userController.deleteUser);

export default router;