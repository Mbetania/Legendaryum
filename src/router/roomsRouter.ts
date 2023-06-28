import express from 'express';
import { getRoomById, createRoom, joinRoom } from "../services/roomService";
import { HTTP_STATUS } from "../types/http";

const roomsRouter = express.Router();

roomsRouter.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await getRoomById(roomId);
    if (!room) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Room not found' });
    } else {
      res.json(room);
    }
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error getting room data.' });
  }
});

roomsRouter.post('/', async (req, res) => {
  const roomData = req.body
  try {
    const room = await createRoom(roomData);
    res.status(HTTP_STATUS.CREATED).json(room);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create room' });
  }
});

roomsRouter.post('/:roomId/addClient', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;

  try {
    const room = await joinRoom(roomId, userId);
    if (!room) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Failed to add client to room' });
    } else {
      res.json(room);
    }
  } catch (err) {
    console.error('Error adding client to room:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add client to room' });
  }
});

export default roomsRouter;
