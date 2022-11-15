const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.leesidy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const appointmentOptionCollection = client.db('doctorsPortal').collection('appointmentOptions');
        const bookingCollection = client.db('doctorsPortal').collection('bookings');

        app.get('/appointmentOptions', async (req, res) => {
            const date = req.query.date;
            const query = {};
            const options = await appointmentOptionCollection.find(query).toArray();
            const bookingQuery = { appointDate: date };
            const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();
            options.forEach(option => {
                const bookOption = alreadyBooked.filter(book => book.treatment === option.name);
                const bookedSlot = bookOption.map(book => book.slot);
                const remainingSlots = option.slots.filter(slot => !bookedSlot.includes(slot))
                option.slots=remainingSlots;
            })

            res.send(options);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking)
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(console.log);


app.get('/', (req, res) => {
    res.send('Doctors portal is running.');
})

app.listen(port, () => {
    console.log(`Doctors portal running on port ${port}`);
})