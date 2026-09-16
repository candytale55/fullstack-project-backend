import { Router } from 'express';
import { isAuth } from '../../middlewares/isAuth';
import { isAdmin } from '../../middlewares/isAdmin';
import {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user.controller';


const usersRouter = Router();

usersRouter.get('/', isAuth, isAdmin, getAllUsers);
usersRouter.get('/:id', isAuth, isAdmin, getUser);
usersRouter.post('/', isAuth, isAdmin, createUser);
usersRouter.patch('/:id', isAuth, isAdmin, updateUser);
usersRouter.delete('/:id', isAuth, isAdmin,  deleteUser);

export default usersRouter;