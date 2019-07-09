const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const auth = require('../../middleware/auth')

const Post = require('../../models/Post')
const User = require('../../models/User')
const Profile = require('../../models/Profile')


// POST api/posts, Create a post, Private
router.post('/',
    [
        auth,
        [
            check('text', 'TEXT IS REQUIRED')
            .not()
            .isEmpty()
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const user = await User.findById(req.user.id).select('-password')

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })

            const post = await newPost.save()
            res.json(post)

        } catch (err) {
            console.error(err.message)
            res.status(500).send('SERVER ERROR')
        }
    }
)

// GET api/posts, Get all Posts, private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 })
        res.json(posts)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('SERVER ERROR')
    }
})

// GET api/posts/:id, Get Post by id, private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) {
            return res.status(404).json({ msg: 'POST NOT FOUND' })
        }
        res.json(post)
    } catch (err) {
        console.error(err.message)
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'POST NOT FOUND' })
        }
        res.status(500).send('SERVER ERROR')
    }
})

// DELETE api/posts/:id, Delete a Post, private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        // Check Post
        

        if(!post) {
            return res.status(404).json({ msg: 'POST NOT FOUND' })
        }
        // Check User
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'USER NOT AUTHORIZED' })
        }

        await post.remove()

        res.json({ msg: 'POST REMOVED' })
    } catch (err) {
        console.error(err.message)
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'POST NOT FOUND' })
        }
        res.status(500).send('SERVER ERROR')
    }
})

// PUT api/posts/like/:id, Like a post, Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        
        // Check if the post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: "POST ALREADY LIKED" })
        }

        post.likes.unshift({ user: req.user.id })
        await post.save()
        res.json(post.likes)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('SERVER ERROR')
    }
})

// PUT api/posts/unlike/:id, unLike a post, Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        
        // Check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: "YOU NEED TO LIKE THE POST FIRST..." })
        }

        // GET REMOVE INDEX
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)
        
        await post.save()
        res.json(post.likes)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('SERVER ERROR')
    }
})

// POST api/posts/comment/:id, Comment on a post, Private
router.post(
    '/comment/:id',
    [
        auth,
        [
            check('text', 'TEXT IS REQUIRED')
            .not()
            .isEmpty()
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const user = await User.findById(req.user.id).select('-password')
            const post = await Post.findById(req.params.id)

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }

            post.comments.unshift(newComment)

            await post.save()
            res.json(post.comments)

        } catch (err) {
            console.error(err.message)
            res.status(500).send('SERVER ERROR')
        }

        
    }
)

// DELETE api/posts/comment/:id/:commend_id, Delete Comment, Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        
        // Get Comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id)
        
        // Make sure comment Exists
        if (!comment) {
            return res.status(404).json({ msg: "COMMENT DOES NOT EXIST"} )
        }

        // Check User
        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "USER NOT AUTHORIZED" })
        }

        // Get Remove Index
        const removeIndex = post.comments
            .map(comment => comment.user.toString())
            .indexOf(req.user.id)

        post.comments.splice(removeIndex, 1)

        await post.save()

        res.json(post.comments)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('SERVER ERROR')
    }
})

module.exports = router