const {Category} = require('../models/category')
const express = require('express')
const router = express.Router()

router.get(`/`,async(req,res) => {
    const categoryList = await Category.find()

    if(!categoryList)
        res.status(500).json({success: false})

    res.send(categoryList);
})

router.get(`/:id`,async(req,res) => {
    const category = await Category.findById(req.params.id)

    if(!category)
        res.status(500).json({
            message: "The category with the given ID was not found!"
        })

    res.status(200).send(category);
})


router.post(`/`, async (req,res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color 
    })
    
    category = await category.save();

    if(!category){
        return res.status(404).send('The category cannot be found!')
    }
    
    res.send(category);
})

router.put(`/:id`, async(req,res) => { 
    const category = await Category.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        {new : true}
    )

    if(!category){
        return res.status(400).send('the category cannot be updated!')
    }
    res.send(category);
})
router.delete(`/:categoryId`,(req,res) => {
    Category.findByIdAndDelete(req.params.categoryId).then(category => {
        if(category){
            return res.status(200).json({
                success: true,
                message: 'the category has been deleted'
            })
        }else{
            return res.status(404).json({
                success: false,
                message: 'the category is not found'
            })
        }
    }).catch(err => {
        return res.status(400).json({
            success: false,
            error: err
        })
    })
})
module.exports = router;