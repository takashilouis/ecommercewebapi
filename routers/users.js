const { User } = require('../models/user')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

router.post('/register', async (req,res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        hashPassword: bcrypt.hashSync(req.body.hashPassword,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    
    user = await user.save();
    if(!user){
        return res.status(500).send("Error: the user cannot be created!")
    }
    res.send(user)
})

router.post('/login', async(req,res) => { 
    const user = await User.findOne({
        email: req.body.email
    })

    const secret = process.env.SECRET
    if(!user){
        return res.status(400).send("wrong credentials!")
    }
    
    

    if(user && bcrypt.compareSync(req.body.password, user.hashPassword)){
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
        res.status(200).send({user: user.email, token: token});
    }else
        res.status(500).send("wrong password!")
})

router.get('/get/count', async (req, res) => {
    try {
        console.log("No error in getting the count");
        const userCount = await User.countDocuments()
        if (!userCount) {
            return res.status(500).json({
                success: false
            });
        }
        res.send({userCount: userCount});
    } catch (error) {
        console.log("Error retrieving user count:", error.stack);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.delete('/:id',(req,res) => {
    User.findByIdAndDelete(req.params.id).then(
        user => {
            if(user){
                return res.status(200).json({ success: true, message:'the user is deleted successfully!'})
            }else{
                return res.status(404).json({ success: false, messaage:'user not found!'})
            }
        }).catch(err => {
            return res.status(500).json({success: false, error: err})
        }
    )
})
module.exports = router;

//1232131