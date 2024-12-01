const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;


const corsOptions = {
    "origin": "*",
    "methods": "GET, HEAD, PUT, PATCH, POST, DELETE",

}

// middleware
app.use(cors(corsOptions));
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Coffee making server is running');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// basic setup done!


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.owq8r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const uri = process.env.MONGODB_URI;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const coffeeCollection = client.db('coffeeDB').collection('coffee');
        const userCollection = client.db('coffeeDB').collection('users');

        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee)
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedCoffee = req.body
            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    chef: updatedCoffee.chef,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo
                }
            }
            const result = await coffeeCollection.updateOne(filter, coffee, options);
            res.send(result);
        })

        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // User related API's
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log("Creating new user", newUser);
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const filter = { email };
            const updatedDoc = {
                $set: {
                    lastLoginTime: req.body?.lastLoginTime
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}
run().catch(console.dir);
