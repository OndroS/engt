const mongoose = require('mongoose')

const Schema = mongoose.Schema


const userAnswersSchema = new Schema({

    userAnswers: {
        type: Object,
        required: true
    },
    currentQuestionIndex: {
        type: Number,
        required: true,
    }

}, { timestamps: true })


module.exports = mongoose.model('UserAnswers', userAnswersSchema)