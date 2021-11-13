const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oteh7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


async function run() {
    try {
        await client.connect();

        const database = client.db("excel_cars");
        const carsCollection = database.collection("cars");
        const ordersCollection = database.collection("orders");
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        // GET CARS 
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        });
        // GET ORDERED CARS 
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        });
        // GET REVIEWS 
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        // GET USERS 
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });


        //Save Orders
        app.post('/placeorder', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.send(result);
        });

        // ADD NEW CAR 
        app.post('/cars', async (req, res) => {
            const newCar = req.body;
            const result = await carsCollection.insertOne(newCar);
            res.send(result);
        });
        // ADD NEW REVIEW 
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
        });

        // GET MY ORDERS
        app.get('/myorders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const myOrders = await cursor.toArray();
            res.json(myOrders);
        });
        //UPDATE ORDER STATUS
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };

            const updateDoc = {
                $set: {
                    status: updatedOrder.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            console.log(result)
            res.json(result);
        });
        //MAKE USER ADMIN
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const updatedUser = req.body;
            const filter = { email: email };

            const updateDoc = {
                $set: {
                    role: updatedUser.role
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(result)
            res.json(result);
        });
        // Cancel Order
        app.delete('/myorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })
        // Delete Product
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.deleteOne(query);
            res.json(result);
        });

        // SAVE USER 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // update/insert user 
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Excel Cars server running...');
});

app.listen(port, () => {
    console.log('listening from port: ', port);
})