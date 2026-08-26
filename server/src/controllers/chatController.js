import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';


export const getOrCreateConversation = async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ error: 'Friend ID required' });

    
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, friendId], $size: 2 }
    }).populate('participants', 'name email');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, friendId]
      });
      
      conversation = await conversation.populate('participants', 'name email');
    }

    res.json(conversation);
  } catch (error) {
    console.error('[chat] Get conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('[chat] Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) return res.status(403).json({ error: 'Not authorized' });

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('[chat] Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



