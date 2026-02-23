require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(async () => {
    // Drop old unique index on patientId if it exists (now patients share patientId across appointments)
    try {
        const collection = mongoose.connection.collection('publicappointments');
        const indexes = await collection.indexes();
        const patientIdIndex = indexes.find(idx => idx.key && idx.key.patientId && idx.unique);
        if (patientIdIndex) {
            await collection.dropIndex(patientIdIndex.name);
            console.log('✅ Dropped old unique index on patientId');
        }
    } catch (err) {
        // Index may not exist, that's fine
        if (err.code !== 27) console.log('Index cleanup note:', err.message);
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
