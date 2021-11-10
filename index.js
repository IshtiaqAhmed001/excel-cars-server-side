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
        const reviewsCollection = database.collection('reviews');

        // GET CARS 
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);

            // GET REVIEWS 
            app.get('/reviews', async (req, res) => {
                const cursor = reviewsCollection.find({});
                const reviews = await cursor.toArray();
                res.send(reviews);
            })
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