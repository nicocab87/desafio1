const express = require("express");
const handlebars = require("express-handlebars");
const {Server} = require ("socket.io"); 
const productsRouter = require ("./Routes/Products.router");
const cartRouter = require("./Routes/Carts.router");
const realTimeRouter = require ("./Routes/RealTimeProducts.router")
const nuevoProducto = require ("./dao/fileManagers/ProductManager");


const app = express();
const port = 8080

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Handlebars setting
app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set(`view engine`, `handlebars`);

app.use(express.static(`${__dirname}/public`));

// Middleware
app.use(`/`, productsRouter);
app.use(`/api/products`, productsRouter);
app.use(`/api/carts`, cartRouter);
app.use(`/realtimeproducts`, realTimeRouter)


const server = app.listen(port,()=>console.log(`Se ha levantado el servidor ${port}`))

const io = new Server (server);

io.on('connection', (socket)=>{
    console.log(`Conectado: ${socket.id}`);

    socket.on('disconnect', ()=>{
        console.log(`${socket.id} desconectado`);
    });

    socket.on('addProduct', async (newProductData)=>{
        const { title, category, description, price, code, stock } = newProductData;
    
        await nuevoProducto.addProduct( title, category, description, price, code, stock);

        const data = await nuevoProducto.getProducts()

        io.emit('updateProduct', data);
    });

    socket.on('deleteProduct', async (idProductToDelete) => {
        await nuevoProducto.deleteProduct(idProductToDelete)

        const data = await nuevoProducto.getProducts()

        io.emit('updateProduct', data)
    })
});




