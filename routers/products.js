const { Product } = require('../models/product')
const { Category } = require('../models/category')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {'image/png' : 'png', 'image/jpeg': 'jpeg', 'image/jpg': 'jpg'}

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if(isValid){
            uploadError = null
        }
        cb(uploadError,'public/uploads')
    },
    filename: function(req,file,cb){
        const extension = FILE_TYPE_MAP[file.mimetype]
        const fileName = file.originalname.split(' ').join('-')
        cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({storage: storage})
router.get('/',async(req,res) => {
    let filter = {}
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');
    //const productList = await Product.find().populate('category');
    if(!productList)
        res.status(500).json({success: false})

    res.send(productList);
})

router.get(`/:id`,async(req,res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if(!product)
        res.status(500).json({success: false})

    res.send(product);
})
router.post(`/`, uploadOptions.single('image'), async (req,res) => {
    const category = await Category.findById(req.body.category)
    if(!category)
        return res.status(400).send("Error: invalid category!")
    
    const file = req.file
    if(!file)
        return res.status(400).send("Error: no image in the request!")

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    
    product = await product.save();
    if(!product){
        return res.status(500).send("Error: the product cannot be created!")
    }
    res.send(product)
})

router.delete(`/:id`,(req,res) => {
    Product.findByIdAndDelete(req.params.id).then(
        product => {
            if(product){
                return res.status(200).json({ success: true, message:'the product is deleted successfully!'})
            }else{
                return res.status(404).json({ success: false, messaage:'product not found!'})
            }
        }).catch(err => {
            return res.status(500).json({success: false, error: err})
        }
    )
})

router.put(`/:id`, async(req,res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid product id');
    }
    const category = await Category.findById(req.body.category);
    if(!category)
        return res.status(400).send('Invalid category');

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        {new : true}
    )

    if(!product){
        return res.status(500).send('the product cannot be updated!')
    }
    res.send(product);
})

router.get(`/get/count`, async (req,res) => {
    try{
        const productCount = await Product.countDocuments()

        if(!productCount){
            res.status(500).json({
                success: false,
                message: 'no products found!'
            })
        }
        res.send({productCount: productCount})
    } catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
})

router.get(`/get/featured/:count`, async (req,res) => {
    try{
        const count = req.params.count ? req.params.count : 0
        const products = await Product.find({isFeatured: true}).limit(+count)

        if(!products){
            res.status(500).json({
                success: false,
                message: 'no featured products found!'
            })
        }
        res.send({products})
    } catch(error){
        res.status(500).json({
            success: false
        })
    }
 
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async(req,res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    }
    const files = req.files
    let imagesPaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    
    if(files){
        files.map(file => {
            imagesPaths.push(`${basePath}${file.filename}`)
        })
    }
    

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true}
    )

    if(!product){
        return res.status(500).send('the product cannot be updated!')
    }

    res.send(product)  
})

module.exports = router