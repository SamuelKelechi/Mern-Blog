require('dotenv').config();
const express = require('express');
const {connect} = require('mongoose')
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blog-images', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed image formats
    },
});

const upload = multer({ storage }); // Multer instance for file uploads

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Routes
app.use('/api/posts', postRoutes); // Post routes
app.use(cors(corsOptions));
app.use(notFound)
app.use(errorHandler)


// Connect to MongoDB
connect(process.env.MONGO_URI).then(app.listen(3000, () => console.log(`server is running on port ${process.env.PORT}`))).catch(error => {console.log(error)})