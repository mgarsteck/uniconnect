const express = require('express')
const router = express.Router()
const request = require('request')
const config = require('config')
const auth  = require('../../middleware/auth')
const { check, validationResult } = require('express-validator/check')

const User = require('../../models/User')
const Profile = require('../../models/Profile')

// GET api/profile/me, current users profile, private route
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name,', 'avatar'])
        if(!profile){
            return res.status(400).json({ msg: 'THERE IS NO PROFILE FOR THIS USER' })
        }
        
        res.json(profile)

    } catch(err) {
        console.log(err.message)
        res.status(500).send('SERVER ERROR')
    }
})

// POST api/profile, create/update user profile, private
router.post(
    '/', 
    [
        auth, 
        [
            check('status', 'STATUS IS REQUIRED').not().isEmpty(),
            check('skills', 'SKILLS IS REQUIRED').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body

        //  BUILD PROFILE OBJECT
        const profileFields = {}
        profileFields.user = req.user.id
        if(company) profileFields.company = company
        if(website) profileFields.website = website
        if(location) profileFields.location = location
        if(bio) profileFields.bio = bio
        if(status) profileFields.status = status
        if(githubusername) profileFields.githubusername = githubusername
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }

        // BUILD SOCIAL OBJECT
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube
        if (twitter) profileFields.social.twitter = twitter
        if (facebook) profileFields.social.facebook = facebook
        if (linkedin) profileFields.social.linkedin = linkedin
        if (instagram) profileFields.social.instagram = instagram

        try {
            let profile = await Profile.findOne({ user: req.user.id })
            if(profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields },
                    { new: true }
                )
                return res.json(profile)
            }

            // CREATE
            profile = new Profile(profileFields)
            await profile.save()
            res.json(profile)

        } catch (err) {
            console.error(err.message)
            res.status(500).send('SERVER ERROR')
            
        }
    }
)

// GET API/PROFILE, GET ALL PROFILES, PUBLIC ROUTE
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("SERVER ERROR")
    }
})

// GET API/PROFILE/user/:user_id, GET Profile by user id, PUBLIC ROUTE
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if(!profile) res.status(400).json({ msg: "PROFILE NOT FOUND" })
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        if(err.kind = 'ObjectId') {
            return res.status(500).json({ msg: "PROFILE NOT FOUND" })
        }
        res.status(500).send("SERVER ERROR")
    }
})

// DELETE api/profile, Deletes USER, PROFILE AND POSTS, PRIVATE
router.delete('/', auth, async(req, res) => {
    try {
        // TODO: REMOVE USERS POSTS
        // REMOVE PROFILE
        await Profile.findOneAndRemove({ user: req.user_id })
        // REMOVE USER
        await User.findOneAndRemove({ _id: req.user_id })

        res.json({ msg: "USER REMOVED" })
    } catch (err) {
        console.error(err.message)
        res.status(500).send("SERVER ERROR")
    }
})

// PUT api/profile/experience, ADD EXPERIENCE, PRIVATE
router.put('/experience', [auth, [
    check('title', 'TITLE IS REQUIRED').not().isEmpty(),
    check('company', 'COMPANY IS REQUIRED').not().isEmpty(),
    check('from', 'FROM IS REQUIRED').not().isEmpty()
    
]], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id })
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('SERVER ERROR')
    }
})

// DELETE api/profile/experience/:exp_id, Delete experience from profile, Private
router.delete('/experience/:exp_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        // Get Remove Index
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)
        
        await profile.save()

        res.json(profile)

    } catch (err) {
        console.error(err.message)
        res.status(500).send("SERVER ERROR")
    }
})

// PUT api/profile/education, ADD education, PRIVATE
router.put('/education', [auth, [
    check('school', 'SCHOOL IS REQUIRED').not().isEmpty(),
    check('degree', 'DEGREE IS REQUIRED').not().isEmpty(),
    check('fieldofstudy', 'FIELD OF STUDY IS REQUIRED').not().isEmpty(),
    check('from', 'FROM DATE IS REQUIRED').not().isEmpty()
    
]], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id })
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('SERVER ERROR')
    }
})

// DELETE api/profile/education/:edu_id, Delete education from profile, Private
router.delete('/education/:edu_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        // Get Remove Index
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1)
        
        await profile.save()

        res.json(profile)
        
    } catch (err) {
        console.error(err.message)
        res.status(500).send("SERVER ERROR")
    }
})

// GET api/profile/github/:username, Get github repo, Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubClientSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node-js' }
        }

        request(options, (error, response, body) => {
            if(error) console.error(error)

            if(response.statusCode !== 200) {
                return res.status(404).json({ msg: "PROFILE NOT FOUND" })
            }

            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('SERVER ERROR')
    }
}) 

module.exports = router