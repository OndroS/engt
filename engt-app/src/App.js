import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import './App.css';

const GET_QUESTIONS = gql`
  {
    getAllQuestionsWithAnswers {
        question {
         _id
         text
       }
       answers {
         _id
         text
         correct
       }
     } 
  }
`;

// console.log('data ', data.questions.length)

const Question = ({ question, answers, onSelectAnswer }) => (
    <div className='Question'>
        <div>
            <h1 className='Question-text'>{question.text}</h1>
            {/* <div className='Answers'>
                {answers.map((answer) => (
                    <div key={answer._id}>
                        <button
                            onClick={() => onSelectAnswer(question._id, answer._id, answer.correct)}
                            className='Answer-btn'
                        >
                            {answer.text}
                        </button>
                        <br/>
                    </div>
                ))}
            </div> */}
        </div>
    </div>
);

function App() {
    const { loading, error, data } = useQuery(GET_QUESTIONS);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
  
    if (error) return <h1>Something went wrong!</h1>;
    if (loading) return <h1>Loading...</h1>;
  
    const handleSelectAnswer = (questionId, answerId, correct) => {
      setUserAnswers((prevUserAnswers) => ({
        ...prevUserAnswers,
        [questionId]: {
          answerId,
          correct,
        },
      }));
    };
  
    const handleNextQuestion = () => {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    };
  
    const handleFinish = () => {
      console.log('User Answers:', userAnswers);
    };
  
    const currentQuestion = data.getAllQuestionsWithAnswers[currentQuestionIndex].question;
    const currentAnswers = data.getAllQuestionsWithAnswers[currentQuestionIndex].answers;
    const isLastQuestion = currentQuestionIndex === data.getAllQuestionsWithAnswers.length - 1;
  
    return (
      <main className='App'>
        <h1>Python: Podmínky a metody</h1>
        <p>
          Lekce {currentQuestionIndex + 1} / {data.getAllQuestionsWithAnswers.length}: Podmínky
        </p>
        <Question question={currentQuestion} answers={currentAnswers} onSelectAnswer={handleSelectAnswer} />
        {currentAnswers.map((answer) => {
          let buttonClassName = 'Answer-btn';
          let buttonText = answer.text;
          if (userAnswers[currentQuestion._id]) {
            if (answer._id === userAnswers[currentQuestion._id].answerId) {
              if (answer.correct) {
                buttonClassName = 'Correct-answer-btn';
                buttonText = 'Correct answer!';
              } else {
                buttonClassName = 'Wrong-answer-btn';
                buttonText = 'Wrong answer';
              }
            } else if (answer.correct) {
              buttonClassName = 'Correct-answer-btn';
              buttonText = 'This is the correct answer';
            }
          }
  
          return (
            <div key={answer._id}>
              <button onClick={() => handleSelectAnswer(currentQuestion._id, answer._id, answer.correct)} className={buttonClassName}>
                {buttonText}
              </button>
              <br />
            </div>
          );
        })}

        {!isLastQuestion ? (
          <button onClick={handleNextQuestion} className='Next-btn'>
            Next
          </button>
        ) : (
          <button onClick={handleFinish} className='Finish-btn'>
            Finish
          </button>
        )}
      </main>
    );
  }

export default App;