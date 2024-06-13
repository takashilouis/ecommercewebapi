const express = require('express');
const app = express();
const bodyParser = require('body-parser');//parsing body request
const morgan = require('morgan');//http logging
const mongoose = require('mongoose'); //db
const cors = require('cors')//CORS : Cross-object r s
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
app.use(cors());
app.options('*',cors());//
//middleware//
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);
//routers
const productsRouter = require('./routers/products')
const categoriesRouter = require('./routers/categories')
const userRouter = require('./routers/users')
const ordersRouter = require('./routers/orders')
const api = process.env.API_URL;

app.use(`${api}/products`,productsRouter)
app.use(`${api}/categories`,categoriesRouter)
app.use(`${api}/users`,userRouter)
app.use(`${api}/orders`,ordersRouter)



//in case the mongodb link is deprecated.
//useNewUrlParser: true
//useUnifiedTopology: true
//dbNam: 'xxx'
mongoose.connect(process.env.DB_URL)
.then(() => { 
    console.log("Connection successful!")
})
.catch((err) => {
    console.log("Connection failed! Err : " + err)
})
//mongodb+srv://louis:Louis1210@nodecluster.eusenaw.mongodb.net/?retryWrites=true&w=majority&appName=NodeCluster
app.listen(3000,()=>{
    console.log(api);
    console.log('server is running http://localhost:3000');
})