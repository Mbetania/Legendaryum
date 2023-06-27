import  express  from "express";
import { authenticateClientById, getClientById } from "../services/clientService";
import { HTTP_STATUS } from "../types/http";

const usersRouter = express.Router();

usersRouter.get('/:userId', async (req, res) =>{
  const {userId } = req.params

  try {
    const client = await getClientById(userId);
    if (client) {
      res.json(client);
    } else {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'User not find'});
    }
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting user data.'})
  }
})

usersRouter.post('/authenticate', async (req, res) => {
  const { username, userId } = req.body;
  try{
    const client = await authenticateClientById(username, userId);
    res.json(client);
  } catch (err){
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to authenticate user'});
  }
})

export default usersRouter;