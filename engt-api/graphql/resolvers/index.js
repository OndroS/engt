const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const User = require('../../models/user')
const Question = require('../../models/question')
const Answer = require('../../models/answer')
const Hintnote = require('../../models/hintnote')
const UserAnswers = require('../../models/useranswers')

module.exports = {

    register: async args => {
        try {
            const { email, password } = args.user

            const user = new User({
                email,
                password: CryptoJS.AES.encrypt(
                    password,
                    "sdd786asd212ntz67x" // TODO: relocate to .env
                ).toString()
            });

            const newUser = await user.save()
            return newUser

        } catch (error) {
            throw error
        }
    },

    login: async args => {
        try {
            const { email, password } = args.user

            const user = await User.findOne({ email: email });

            const bytes = CryptoJS.AES.decrypt(user.password, "sdd786asd212ntz67x"); // TODO: relocate to .env

            const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

            if (originalPassword !== password) {
                throw ("Wrong password or username!");
            }

            const accessToken = jwt.sign(
                { id: user._id },
                "sdd786asd212ntz67x" // TODO: relocate to .env
                // { expiresIn: "5d" }
            );

            return { email, accessToken }
        } catch (error) {
            throw error
        }
    },

    questions: async (_, context) => {
        // const { user } = context; // Get the authenticated user from context
        // if (!user) {
        //     throw new Error("You are not authenticated!");
        // }
        try {
            const questionsFetched = await Question.find()
            return questionsFetched;
        }
        catch (error) {
            throw error
        }
    },

    createQuestion: async args => {
        try {
            const { text } = args.question
            const question = new Question({
                text
            })
            const newQuestion = await question.save()
            return { ...newQuestion._doc, _id: newQuestion.id }
        }
        catch (error) {
            throw error
        }
    },

    answers: async () => {
        try {
            const answersFetched = await Answer.find()

            return answersFetched.map(answer => {
                return {
                    ...answer._doc,
                    _id: answer._id,
                    text: answer.text,
                    correct: answer.correct,
                    questionId: answer.questionId,
                    createdAt: new Date(answer._doc.createdAt).toISOString()
                }
            })
        }
        catch (error) {
            throw error
        }
    },

    createAnswer: async args => {
        try {
            const { text, correct, questionId } = args.answer;

            if (!mongoose.Types.ObjectId.isValid(questionId)) {
                throw new Error('Invalid questionId');
            }

            const existingQuestion = await Question.findById(questionId);
            if (!existingQuestion) {
                throw new Error('Question not found');
            }

            const answer = new Answer({
                text,
                correct,
                questionId: existingQuestion._id,
            });

            const newAnswer = await answer.save();

            return {
                ...newAnswer._doc,
                _id: newAnswer.id,
                questionId: existingQuestion._id
            };
        } catch (error) {
            throw error;
        }
    },

    getAnswersByQuestionId: async ({ answer: { _id } }) => {
        try {
            const fetchedAnswers = await Answer.find({ questionId: _id });
            return fetchedAnswers.map(answer => {
                return {
                    ...answer._doc,
                    _id: answer._id,
                    text: answer.text,
                    correct: answer.correct,
                    questionId: answer.questionId,
                }
            })
        } catch (error) {
            throw error;
        }
    },

    hintnotes: async () => {
        try {
            const hintnotesFetched = await Hintnote.find()
            return hintnotesFetched.map(hintnote => {
                return {
                    ...hintnote._doc,
                    _id: hintnote._id,
                    text: hintnote.text,
                    correct: hintnote.correct,
                    questionId: hintnote.questionId,
                    createdAt: new Date(hintnote._doc.createdAt).toISOString()
                }
            })
        }
        catch (error) {
            throw error
        }
    },

    createHintnote: async args => {
        try {
            const { text, questionId } = args.hintnote;

            if (!mongoose.Types.ObjectId.isValid(questionId)) {
                throw new Error('Invalid questionId');
            }

            const existingQuestion = await Question.findById(questionId);
            if (!existingQuestion) {
                throw new Error('Question not found');
            }

            const hintnote = new Hintnote({
                text,
                questionId: existingQuestion._id,
            });

            const newHintnote = await hintnote.save();

            return {
                ...newHintnote._doc,
                _id: newHintnote.id,
                questionId: existingQuestion._id
            };
        } catch (error) {
            throw error;
        }
    },

    getAllQuestionsWithAnswers: async () => { // TODO: Use mongo populate instead
        try {
            // Fetch all questions
            const questions = await Question.find();

            // Fetch answers and hint notes for each question and create the QuestionWithDetails array
            const questionWithDetailsArray = await Promise.all(
                questions.map(async (question) => {
                    const answers = await Answer.find({ questionId: question._id });
                    const hintNotes = await Hintnote.find({ questionId: question._id });

                    return {
                        question: {
                            ...question._doc,
                            _id: question._id,
                            text: question.text,
                            createdAt: new Date(question._doc.createdAt).toISOString(),
                        },
                        answers: answers.map((answer) => ({
                            ...answer._doc,
                            _id: answer._id,
                            text: answer.text,
                            correct: answer.correct,
                            questionId: answer.questionId,
                            createdAt: new Date(answer._doc.createdAt).toISOString(),
                        })),
                        hintnotes: hintNotes.map((hintnote) => ({
                            ...hintnote._doc,
                            _id: hintnote._id,
                            text: hintnote.text,
                            questionId: hintnote.questionId,
                            createdAt: new Date(hintnote._doc.createdAt).toISOString(),
                        })),
                    };
                })
            );

            return questionWithDetailsArray;
        } catch (error) {
            throw error;
        }
    },

    getUserAnswers: async () => { // TODO: HOTFIX, BE MERCIFUL WHO IS READING THIS
        try {
            const userAnswersFetched = await UserAnswers.find().sort({ createdAt: -1 });

            if (userAnswersFetched.length === 0) {
                return null;
            }

            const newestUserAnswer = userAnswersFetched[0];
            const { userAnswers, currentQuestionIndex } = newestUserAnswer;

            return {
                ...newestUserAnswer._doc,
                userAnswers,
                currentQuestionIndex,
            };
        }
        catch (error) {
            throw error
        }
    },

    createUserAnswers: async args => {
        try {
            const { userAnswers, currentQuestionIndex } = args.userAnswers;

            const useranswer = new UserAnswers({
                userAnswers,
                currentQuestionIndex
            });

            const newUseranswer = await useranswer.save();

            return newUseranswer;
        } catch (error) {
            throw error;
        }
    },
} 