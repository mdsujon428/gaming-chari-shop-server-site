const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const app = express();

const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.witrp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect()

    const database = client.db('Gaming-Chair-Shop');
    const productsCollection = database.collection('products');
    const users = database.collection('users');
    const myOrdersCollection = database.collection('myOrders');
    const usersReviewCollection = database.collection('reviews')

    // Get product by id
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await productsCollection.findOne(query);
      res.json(result)
    })

    //API to get products 
    app.get('/products/:variable', async (req, res) => {
      const variable = req.params.variable;
      const query = {}
      const cursor = productsCollection.find(query);
      let result;

      if (variable === 'home') {
        result = await cursor.limit(6).toArray()
      }
      if (variable === 'explore') {
        result = await cursor.toArray()
      }
      res.json(result)
    })
    //API to post new product to productsCollection
    app.post('/products',async(req,res)=>{
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct)
      res.json(result)
    })
    //API to delete data from productsCollection
    app.delete('/products/:id',async(req,res)=>{
      const id = req.params.id;
      console.log(id)
      const query = { _id: ObjectId(id) }
      const result = await productsCollection.deleteOne(query)
      res.json(result)
    })
    //API to post data to user collection.
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await users.insertOne(newUser);
      res.json(result)
    });
    
    //API to get admin 
    app.get('/users/:email',async(req,res)=>{
      const email = req.params?.email;
      const query = {email:email};
      const result = await users.findOne(query)
      let isAdmin = false;
      if(result?.role === 'admin'){
        isAdmin= true;
      }
      res.json({admin:isAdmin})
    })
    //API to post order data to myOrdersCollection
    app.post('/myOrders',async(req,res)=>{
      const myOrder = req.body;
      const result = await myOrdersCollection.insertOne(myOrder);
      res.json(result);
    })

    // API get specific data data from myOrdersCollection by user email.
    app.get('/myOrders/:email',async(req,res)=>{
      const email = req.params?.email;
      const query = {userEmail:email};
      const cursor = myOrdersCollection.find(query);
      const result = await cursor.toArray();
      res.json(result)
    })
    //API DELETE data from myOrdersCollection by id
    app.delete('/myOrders/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await myOrdersCollection.deleteOne(query)
      res.json(result)
    })
    //API to post user review to usersReviewCollection
    app.post('/review',async(req,res)=>{
      const userReview = req.body;
      const result = await usersReviewCollection.insertOne(userReview)
      res.json(result)
    })
    //API to get data from usersReviewCollection
    app.get('/review',async(req,res)=>{
      const cursor = usersReviewCollection.find({})
      const result = await cursor.toArray()
      res.json(result)
    })
  }
  finally {
    //   await client.close()
  }
}
run().catch(console.dir)



app.get('/', (req, res) => {
  res.send("Gaming Chair Shop server is running")
});

app.listen(port, () => {
  console.log("Server is running on port ", port)
})