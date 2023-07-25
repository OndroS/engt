const mongoose = require('mongoose')

const Schema = mongoose.Schema


const hintnoteSchema = new Schema({

    text: {
        type: String,
        required: true,
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    },

}, { timestamps: true })


module.exports = mongoose.model('Hintnote', hintnoteSchema)