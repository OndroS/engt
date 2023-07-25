const mongoose = require('mongoose')

const Schema = mongoose.Schema


const answerSchema = new Schema({

    text: {
        type: String,
        required: true,
    },
    correct: {
        type: Boolean,
        required: true,
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    },

}, { timestamps: true })


module.exports = mongoose.model('Answer', answerSchema)