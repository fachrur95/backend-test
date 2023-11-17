import express from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import { todoValidation } from '../validations';
import { todoController } from '../controllers';

const router = express.Router();

router
  .route('/')
  .get(auth(), validate(todoValidation.getTodos), todoController.getTodos)
  .post(auth(), validate(todoValidation.createTodo), todoController.createTodo);

router
  .route('/:todoId')
  .get(auth(), validate(todoValidation.getTodo), todoController.getTodo)
  .patch(auth(), validate(todoValidation.updateTodo), todoController.updateTodo)
  .delete(auth(), validate(todoValidation.deleteTodo), todoController.deleteTodo);

export default router;