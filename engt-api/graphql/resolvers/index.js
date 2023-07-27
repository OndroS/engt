const dotenv = require("dotenv");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const User = require('../../models/user')
const Question = require('../../models/question')
const Answer = require('../../models/answer')
const Hintnote = require('../../models/hintnote')
const UserAnswers = require('../../models/useranswers')

dotenv.config();

module.exports = {

    // Function to register a new user
    register: async args => {
        try {
            const { email, password } = args.user

            // Create a new User instance with the provided email and encrypted password
            const user = new User({
                email,
                password: CryptoJS.AES.encrypt(
                    password,
                    process.env.SECRET_KEY
                ).toString()
            });

            // Save the newly created user to the database
            const newUser = await user.save()

            // Return the details of the newly registered user
            return newUser;
        } catch (error) {
            throw error
        }
    },

    // Function to handle user login
    login: async args => {
        try {
            const { email, password } = args.user

            // Find the user with the provided email in the database
            const user = await User.findOne({ email: email });

            // Decrypt the user's password using CryptoJS
            const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);

            const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

            // Check if the provided password matches the decrypted password
            if (originalPassword !== password) {
                throw ("Wrong password or username!");
            }

            // Generate an access token using jwt.sign
            const accessToken = jwt.sign(
                { id: user._id },
                process.env.SECRET_KEY
                // { expiresIn: "5d" }
            );

            // Return an object containing the user's email and the access token
            return { email, accessToken };
        } catch (error) {
            throw error
        }
    },

    // Function to fetch all questions from the database
    questions: async (_, context) => {
        try {
            const questionsFetched = await Question.find()
            return questionsFetched;
        }
        catch (error) {
            throw error
        }
    },

    // Function to create a new question
    createQuestion: async args => {
        try {
            const { text } = args.question

            // Create a new Question instance with the provided text
            const question = new Question({
                text
            })
            const newQuestion = await question.save()

            // Return an object containing the details of the newly created question, including _id
            return { ...newQuestion._doc, _id: newQuestion.id };
        }
        catch (error) {
            throw error
        }
    },

    // Function to fetch all answers from the database
    answers: async () => {
        try {
            const answersFetched = await Answer.find()

            // Map the fetched answers to a new array with modified properties
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

    // Function to create a new answer for a specific question
    createAnswer: async args => {
        try {
            const { text, correct, questionId } = args.answer;

            // Validate the questionId format to ensure it is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(questionId)) {
                throw new Error('Invalid questionId');
            }

            // Check if the question exists in the database
            const existingQuestion = await Question.findById(questionId);
            if (!existingQuestion) {
                throw new Error('Question not found');
            }

            // Create a new Answer instance with the provided text, correct flag, and associated questionId
            const answer = new Answer({
                text,
                correct,
                questionId: existingQuestion._id,
            });

            const newAnswer = await answer.save();

            // Return an object containing the details of the newly created answer, including _id and questionId
            return {
                ...newAnswer._doc,
                _id: newAnswer.id,
                questionId: existingQuestion._id
            };
        } catch (error) {
            throw error;
        }
    },

    // Function to fetch answers based on the provided questionId
    getAnswersByQuestionId: async ({ answer: { _id } }) => {
        try {
            const fetchedAnswers = await Answer.find({ questionId: _id });

            // Map the fetched answers to a new array with modified properties
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

    // Function to fetch all hint notes from the database
    hintnotes: async () => {
        try {
            const hintnotesFetched = await Hintnote.find()

            // Map the fetched hint notes to a new array with modified properties
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

    // Function to create a new hintnote for a specific question
    createHintnote: async args => {
        try {
            const { text, questionId } = args.hintnote;

            // Validate the questionId format to ensure it is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(questionId)) {
                throw new Error('Invalid questionId');
            }

            // Check if the question exists in the database
            const existingQuestion = await Question.findById(questionId);
            if (!existingQuestion) {
                throw new Error('Question not found');
            }

            // Create a new Hintnote instance with the provided text and associated questionId
            const hintnote = new Hintnote({
                text,
                questionId: existingQuestion._id,
            });

            const newHintnote = await hintnote.save();

            // Return an object containing the details of the newly created hint note
            return {
                ...newHintnote._doc,
                _id: newHintnote.id,
                questionId: existingQuestion._id
            };
        } catch (error) {
            throw error;
        }
    },

    // Function to fetch all questions with their associated answers and hint notes
    getAllQuestionsWithAnswers: async () => { // TODO: If time left, use mongo populate instead
        try {
            const questions = await Question.find();

            // Use Promise.all to concurrently fetch answers and hintnotes for each question
            const questionWithDetailsArray = await Promise.all(
                questions.map(async (question) => {
                    const answers = await Answer.find({ questionId: question._id });
                    const hintNotes = await Hintnote.find({ questionId: question._id });

                    // Return an object with question, answers, and hintnotes details
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

            // Return an array of questions with their associated answers and hintnotes
            return questionWithDetailsArray;
        } catch (error) {
            throw error;
        }
    },

    // Function to get user answers from the database
    getUserAnswers: async () => {
        try {
            // Fetch user answers from the database and sort them in descending order of creation time
            const userAnswersFetched = await UserAnswers.find().sort({ createdAt: -1 });

            // Check if there are any user answers in the database
            if (userAnswersFetched.length === 0) {
                // If no user answers are found, return null to indicate no data
                return null;
            }
            // Get the most recent user answer from the sorted list (first element)
            const newestUserAnswer = userAnswersFetched[0];

            // Extract userAnswers and currentQuestionIndex from the newestUserAnswer

            const { userAnswers, currentQuestionIndex } = newestUserAnswer;
            // Return an object with the userAnswers and currentQuestionIndex, along with other properties from newestUserAnswer
            // We use spread operator to include all other properties from newestUserAnswer
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

    // Function to create or update user answers in the database
    createUserAnswers: async args => {
        try {
            const { userAnswers, currentQuestionIndex } = args.userAnswers;

            // Find the last user answer record
            const lastUserAnswer = await UserAnswers.findOne().sort({ createdAt: -1 });

            if (lastUserAnswer) {
                // If an existing user answer record is found, update it with the new data
                lastUserAnswer.userAnswers = userAnswers;
                lastUserAnswer.currentQuestionIndex = currentQuestionIndex;
                const updatedUserAnswer = await lastUserAnswer.save();

                // Return the updated user answer
                return updatedUserAnswer;
            } else {
                // If no previous record exists, create a new UserAnswers 
                const newUserAnswer = new UserAnswers({
                    userAnswers,
                    currentQuestionIndex
                });
                const savedUserAnswer = await newUserAnswer.save();

                // Return the newly created user answer
                return savedUserAnswer;
            }
        } catch (error) {
            throw error;
        }
    },
} 