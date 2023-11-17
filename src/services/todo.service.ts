import { Todo, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import { PaginationResponse } from '../types/response';
import getPagination from '../utils/pagination';
import { NestedObject } from '../utils/pickNested';

/**
 * Create a todo
 * @param {Object} todoBody
 * @returns {Promise<Todo>}
 */
const createTodo = async (
  userId: string,
  title: string,
  description: string,
  entryDate: Date,
): Promise<Todo> => {
  return prisma.todo.create({
    data: {
      title,
      description,
      entryDate,
      userId,
    }
  });
};

/**
 * Query for todos
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTodos = async <Key extends keyof Todo>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
    search?: string;
  },
  conditions?: NestedObject,
  keys: Key[] = [
    'id',
    'title',
    'description',
    'entryDate',
    'isCompleted',
    'createdAt',
    'updatedAt',
  ] as Key[]
): Promise<PaginationResponse<Pick<Todo, Key>>> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'asc';
  const search = options.search;

  let globalSearch: Prisma.TodoWhereInput = {};

  if (search && search !== "") {
    globalSearch = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
  }

  const where = { ...filter, ...conditions, ...globalSearch };
  try {
    const getCountAll = prisma.todo.count({ where });
    const getTodos = prisma.todo.findMany({
      where,
      select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
      skip: page * limit,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortType } : undefined
    });
    const [countAll, todos] = await Promise.all([getCountAll, getTodos]);
    const { totalPages, nextPage } = getPagination({ page, countAll, limit });
    return {
      currentPage: page,
      totalPages,
      nextPage,
      countRows: todos.length,
      countAll,
      rows: todos as Pick<Todo, Key>[],
    };
  } catch (error) {
    // Tangani kesalahan jika ada
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An error occurred');
  }
};

/**
 * Get todo by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Todo, Key> | null>}
 */
const getTodoById = async <Key extends keyof Todo>(
  id: string,
  keys: Key[] = [
    'id',
    'title',
    'description',
    'entryDate',
    'isCompleted',
    'createdAt',
    'updatedAt',
    'userId',
  ] as Key[]
): Promise<Pick<Todo, Key> | null> => {
  return prisma.todo.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Todo, Key> | null>;
};

/**
 * Update todo by id
 * @param {ObjectId} todoId
 * @param {Object} updateBody
 * @returns {Promise<Todo>}
 */
const updateTodoById = async <Key extends keyof Todo>(
  todoId: string,
  updateBody: Prisma.TodoUncheckedUpdateInput,
  keys: Key[] = ['id', 'title', 'description', 'userId'] as Key[]
): Promise<Pick<Todo, Key> | null> => {
  const todo = await getTodoById(todoId, ['id', 'title', 'description', 'userId']);
  if (!todo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  const { userId, ...dataUpdate } = updateBody;
  if (todo.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden to modify');
  }
  const updatedTodo = await prisma.todo.update({
    where: { id: todo.id },
    data: dataUpdate,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedTodo as Pick<Todo, Key> | null;
};

/**
 * Delete todo by id
 * @param {ObjectId} todoId
 * @returns {Promise<Todo>}
 */
const deleteTodoById = async (todoId: string): Promise<Todo> => {
  const todo = await getTodoById(todoId);
  if (!todo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  await prisma.todo.delete({ where: { id: todo.id } });
  return todo;
};

export default {
  createTodo,
  queryTodos,
  getTodoById,
  updateTodoById,
  deleteTodoById
};
