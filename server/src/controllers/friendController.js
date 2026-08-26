import { User } from '../models/User.js';
import { FriendRequest } from '../models/FriendRequest.js';


export const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email query required' });

    const currentUser = await User.findById(req.user._id);
    
    
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('-password');

    
    const results = users.filter(u => !currentUser.friends.includes(u._id));
    
    res.json(results);
  } catch (error) {
    console.error('[friend] Search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    const existingRequest = await FriendRequest.findOne({
      senderId: req.user._id,
      receiverId
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Request already sent or exists' });
    }

    
    const reverseRequest = await FriendRequest.findOne({
      senderId: receiverId,
      receiverId: req.user._id,
      status: 'pending'
    });

    if (reverseRequest) {
      return res.status(400).json({ error: 'This user already sent you a request' });
    }

    const request = await FriendRequest.create({
      senderId: req.user._id,
      receiverId
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('[friend] Send request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiverId: req.user._id,
      status: 'pending'
    }).populate('senderId', 'name email');
    
    res.json(requests);
  } catch (error) {
    console.error('[friend] Get pending error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiverId: req.user._id,
      status: 'pending'
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'accepted';
    await request.save();

    
    await User.findByIdAndUpdate(request.senderId, { $addToSet: { friends: request.receiverId } });
    await User.findByIdAndUpdate(request.receiverId, { $addToSet: { friends: request.senderId } });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('[friend] Accept request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiverId: req.user._id,
      status: 'pending'
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('[friend] Reject request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email');
    res.json(user.friends);
  } catch (error) {
    console.error('[friend] Get friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
