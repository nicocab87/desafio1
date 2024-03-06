const {Router} = require ("express");
const manager = require("../dao/dbManagers/products");

const router = Router();

router.get('/', async (req, res) => {
    const data = await manager.getProducts();
    const productsLimit = parseInt(req.query.limit);

    const productsFiltered = data.slice(0, productsLimit);

    const dataToRender = (!productsLimit ? data : productsFiltered)
    try {
        res.render('home', {dataToRender} )
    } catch (error) {
        res.status(440).send(error)
    }
})

router.get('/products', async (req, res) => {

    let page = req.query.page || 1
    let limit = req.query.limit || 5
    let opt = {}

    if(req.query.query){
        opt = {
            $or: [{description:req.query.query}, {category:req.query.query}]
        }
    }

    let { docs, ...rest } = await manager.getPaginate(page, limit, opt)

    let product = docs

    let nextLink = rest.hasNextPage ? `products?page=${rest.nextPage}&limit=${limit} ` : null
    let prevLink =rest.hasPrevPage ? `products?page=${rest.prevPage}&limit=${limit} ` : null

    // Cart
    let cart =

    res.render('products',{product, ...rest, nextLink, prevLink})
    //res.send({status:'succes', ...rest})
})

router.get('/realtimeproducts', async (req, res) => {

    const data = await manager.getProducts();

    try {
        res.render('realTimeProducts', {data} )
    } catch (error) {
        res.status(440).send(error)
    }
})

router.get('/chat', async (req, res) => {

    res.render('chat', {})
})


router.get(`/:pid`, async (req, res) => {
    const productId = req.params.pid

    try {
    const dataToRender = await manager.getProductById(productId)
    res.render('home',{dataToRender})

    } catch (error) {
        res.status(404).send(error)
    }
})

module.exports = router;