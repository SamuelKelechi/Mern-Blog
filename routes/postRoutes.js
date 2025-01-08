const {Router} = require('express')
const upload = require('../config/multerConfig'); // Adjust path to your multer setup

const {createPost, getPosts, getPost, editPost, deletePost} = require('../controllers/postControllers')


const router = Router()

router.post('/', upload.single('image'), createPost)
router.get('/', getPosts)
router.get('/:id', getPost)
router.patch('/:id', upload.single('image'), editPost)
router.delete('/:id', deletePost)


module.exports = router