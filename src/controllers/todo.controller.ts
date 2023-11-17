import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { todoService } from '../services';
import { FiltersType } from '../types/filtering';
import pickNested from '../utils/pickNested';
import { User } from '@prisma/client';

const createTodo = catchAsync(async (req, res) => {
  const user = req.user as User;
  const { title, description, entryDate } = req.body;
  const todo = await todoService.createTodo(user.id, title, description, entryDate);
  res.status(httpStatus.CREATED).send(todo);
});

const getTodos = catchAsync(async (req, res) => {
  const user = req.user as User;
  const filter = pick(req.query, ['title', 'description', 'isCompleted']);
  filter.userId = user.id;
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'search']);
  const conditions = pickNested(req.query?.filters as FiltersType);
  const result = await todoService.queryTodos(filter, options, conditions);
  res.send(result);
});

const getTodo = catchAsync(async (req, res) => {
  const user = req.user as User;
  const todo = await todoService.getTodoById(req.params.todoId);
  if (!todo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  if (user.id !== todo.userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden access');
  }
  res.send(todo);
});

const updateTodo = catchAsync(async (req, res) => {
  const user = req.user as User;
  const todo = await todoService.updateTodoById(req.params.todoId, { ...req.body, userId: user.id });
  res.send(todo);
});

const deleteTodo = catchAsync(async (req, res) => {
  await todoService.deleteTodoById(req.params.todoId);
  // res.status(httpStatus.NO_CONTENT).send();
  res.status(httpStatus.OK).send({ id: req.params.todoId, message: "Deleted" });
});

export default {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo
};
