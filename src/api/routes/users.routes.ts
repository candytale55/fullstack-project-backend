import { Router } from 'express';
import {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user.controller';


const usersRouter = Router();

usersRouter.get('/', getAllUsers);
usersRouter.get('/:id', getUser);
usersRouter.post('/', createUser);
usersRouter.patch('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;