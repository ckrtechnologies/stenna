import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import wallpaperRoutes from './routes/wallpaperRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import visualizerRoutes from './routes/visualizerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dealerRoutes from './routes/dealerRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import queriesRoutes from './routes/queriesRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';

const app = express();

// Middleware
app.use(helmet());


app.use(cors({
    origin: true, // Allows all origins with credentials
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    console.log("Ping: Root endpoint hit");
    res.json({ message: 'Wallpaper API is running' });
});


// Updated lines in app.js
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



// Versioned Routes
const apiV1 = express.Router();

apiV1.use('/auth', authRoutes);
apiV1.use('/users', userRoutes);
apiV1.use('/categories', categoryRoutes);
apiV1.use('/groups', groupRoutes);
apiV1.use('/wallpapers', wallpaperRoutes);
apiV1.use('/wishlist', wishlistRoutes);
apiV1.use('/leads', leadRoutes);
apiV1.use('/visualizer', visualizerRoutes);
apiV1.use('/analytics', analyticsRoutes);
apiV1.use('/store', storeRoutes);
apiV1.use('/upload', uploadRoutes);
apiV1.use('/dealers', dealerRoutes);
apiV1.use('/books', bookRoutes);
apiV1.use('/queries', queriesRoutes);
apiV1.use('/ai', aiRoutes);
apiV1.use('/pdf', pdfRoutes);

app.use('/api/v1', apiV1);

export default app;
