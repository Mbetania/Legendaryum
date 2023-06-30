import express from 'express';
import { authenticateClientById, getClientById } from "../services/clientService";
import { HTTP_STATUS } from "../types/http";

const usersRouter = express.Router();

usersRouter.get('/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const client = await getClientById(clientId);
    if (!client) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
    } else {
      res.json(client);
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting user data.' });
  }
});

// usersRouter.get('/username/:username', async (req, res) => {
//   const { username } = req.params;

//   try {
//     const client = await getClientByUsername(username);
//     if (!client) {
//       res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
//     } else {
//       res.json(client);
//     }
//   } catch (err) {
//     console.error('Error fetching user:', err);
//     res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting user data.' });
//   }
// });

usersRouter.post('/authenticate', async (req, res) => {
  const { username, clientId } = req.body;

  try {
    const client = await authenticateClientById(clientId);
    if (!client) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Failed to authenticate user' });
    } else {
      res.json(client);
    }
  } catch (err) {
    console.error('Error authenticating user:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to authenticate user' });
  }
});

export default usersRouter;
