import Joi from 'joi';

const createTodo = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    entryDate: Joi.date(),
    isCompleted: Joi.boolean(),
  })
};

const getTodos = {
  query: Joi.object().keys({
    search: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getTodo = {
  params: Joi.object().keys({
    todoId: Joi.string()
  })
};

const updateTodo = {
  params: Joi.object().keys({
    todoId: Joi.string()
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      entryDate: Joi.date(),
      isCompleted: Joi.boolean(),
    })
    .min(1)
};

const deleteTodo = {
  params: Joi.object().keys({
    todoId: Joi.string()
  })
};

export default {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo
};
