import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from "morgan";
import cors from "cors";
import Post from './models/Post.js';
import userRoutes from './routes/users.js'
import authRoutes from './routes/auth.js'
import commentRoutes from './routes/commentRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use('/api/posts/postId/comments', commentRoutes);

console.log('Mongo URI:', MONGO_URI);
console.log('Port:', PORT);

import postsRoutes from './routes/posts.js';
app.use('/api/posts', postsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB error:', err.message));

// Testing route to create a sample post
app.get('/test', async (req, res) => {
  try {
    const post = new Post({ title: 'Hello', body: 'This is a test post' });
    await post.save();
    res.send('Test post saved!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// Root route
app.get('/', (req, res) => res.send('API running'));
