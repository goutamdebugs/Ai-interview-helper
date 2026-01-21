const mongoose = require('mongoose')

const dbconnection =  async() => {
    try {
        await mongoose.connect("mongodb://localhost:27017/Ai-interview")
        console.log('Database connection nsuccesfully')
    } catch (error) {
        console.log('database not connected db.js',error);
                
    }
}

module.exports = dbconnection