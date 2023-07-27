const { buildSchema } = require('graphql')


module.exports = buildSchema(`

  scalar JSONObject

  type User {
    _id: ID!
    email: String!
    password: String!
    createdAt: String!
  }

  type Auth {
    email: String!
    accessToken: String!
  }

  type Question {
    _id: ID!
    text: String!
    createdAt: String!
  }

  type Answer {
    _id: ID!
    text: String!
    correct: Boolean!
    questionId: ID!
    createdAt: String!
  }

  type Hintnote {
    _id: ID!
    text: String!
    questionId: ID!
    createdAt: String!
  }

  input UserInput {
    email: String!
    password: String!
  }

  input QuestionInput {
    text: String!
  }

  input QuestionID {
    _id: ID!
  }

  input AnswerInput {
    text: String!
    correct: Boolean!
    questionId: ID!
  }

  input HintnoteInput {
    text: String!
    questionId: ID!
  }

  type UserAnswers {
    userAnswers: JSONObject
    currentQuestionIndex: Int
  }

  input UserAnswersInput {
    userAnswers: JSONObject
    currentQuestionIndex: Int!
  }

  type QuestionWithAnswers {
    question: Question!
    answers: [Answer!]!
    hintnotes: [Hintnote]!
  }

  type Query {
    login(user:UserInput):Auth 
    questions:[Question!]
    getAnswersByQuestionId(answer:QuestionID):[Answer!]
    getHintnotesByQuestionId(hintnote:QuestionID):[Hintnote!]
    answers: [Answer!]
    hintnotes: [Hintnote!]
    getAllQuestionsWithAnswers: [QuestionWithAnswers!]!
    getUserAnswers: UserAnswers!
  }

  type Mutation {
    register(user:UserInput): User
    createQuestion(question:QuestionInput): Question
    createAnswer(answer:AnswerInput): Answer
    createHintnote(hintnote:HintnoteInput): Hintnote
    createUserAnswers(userAnswers:UserAnswersInput): UserAnswers
  }

  schema {
    query: Query
    mutation: Mutation
  }
`)