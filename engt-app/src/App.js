import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { ArrowRight, XCircleFill } from 'react-bootstrap-icons';

import { Button, Container, Navbar } from 'react-bootstrap';

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
       hintnotes {
        _id
        text
      }
     } 
  }
`;

const Question = ({ question }) => (
    <div className='question'>
        <div>
            <div className='question-text'>{question.text}</div>
        </div>
    </div>
);

function App() {
    const { loading, error, data } = useQuery(GET_QUESTIONS);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [isPaused, setIsPaused] = useState(false);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);
    const [showBtnNext, setShowBtnNext] = useState(false);
    const [showHintNote, setShowHintNote] = useState(false);


    useEffect(() => {
        let timer;
        if (!isPaused && timeRemaining > 0) {
            timer = setInterval(() => setTimeRemaining((prevTime) => prevTime - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [timeRemaining, isPaused]);

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
        setShowHintNote(!correct);
        setIsPaused(true)
        setShowBtnNext(true)
    };

    const handleNextQuestion = () => {
        setIsPaused(false)
        setTimeRemaining(30);
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setShowBtnNext(false)
        setShowHintNote(false)
    };

    const handleFinish = () => {
        setFinished(true)
        const score = calculateUserScore(userAnswers);
        setScore(score.scorePercentage)
        setNumCorrectAnswers(score.correctAnswers)
        setShowBtnNext(true)
        setShowHintNote(false)
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setTimeRemaining(30)
        setIsPaused(false)
        setFinished(false)
        setShowBtnNext(false)
        setShowHintNote(false)
    };

    function calculateUserScore(userAnswers) {
        const totalQuestions = Object.keys(data.getAllQuestionsWithAnswers).length;
        let correctAnswers = 0;

        for (const questionId in userAnswers) {
            if (userAnswers.hasOwnProperty(questionId)) {
                if (userAnswers[questionId].correct) {
                    correctAnswers++;
                }
            }
        }

        const scorePercentage = (correctAnswers / totalQuestions) * 100;
        return { scorePercentage, correctAnswers };
    }

    const currentQuestion = data.getAllQuestionsWithAnswers[currentQuestionIndex].question;
    const currentAnswers = data.getAllQuestionsWithAnswers[currentQuestionIndex].answers;
    const isLastQuestion = currentQuestionIndex === data.getAllQuestionsWithAnswers.length - 1;

    return (
        <main className='App'>
            <Navbar className='header-navbar' expand="xxl">
                <div className='header'>
                    <div className='header-h1'>Python: Podmínky a metody</div>
                    <div className='header-h2'>Lekce {currentQuestionIndex + 1} / {data.getAllQuestionsWithAnswers.length}: Podmínky</div>
                </div>
            </Navbar>
            <Container>
                <div className='box'>
                    <div className='question-box'>
                        {!finished &&
                            <div className='question-box-header'>
                                <div className='question-counter'>Otázka {currentQuestionIndex + 1} / {data.getAllQuestionsWithAnswers.length}</div>
                                <div className='question-counter'>Zbývá {timeRemaining} sekund</div>
                            </div>
                        }
                        {!finished && (
                            timeRemaining > 0 ?
                                <div>
                                    <Question question={currentQuestion} answers={currentAnswers} />

                                    <div className='answers'>
                                        {currentAnswers.map((answer) => {
                                            let buttonClassName = 'answer-btn';
                                            let buttonText;
                                            let resultClassName;
                                            if (userAnswers[currentQuestion._id]) {
                                                if (answer._id === userAnswers[currentQuestion._id].answerId) {
                                                    if (answer.correct) {
                                                        buttonClassName = 'correct answer-btn';
                                                        resultClassName = 'result-correct'
                                                        buttonText = 'Správně';
                                                    } else {
                                                        buttonClassName = 'wrong answer-btn';
                                                        resultClassName = 'result-wrong'
                                                        buttonText = 'Špatně';
                                                    }
                                                } else if (answer.correct) {
                                                    buttonClassName = 'correct answer-btn';
                                                    resultClassName = 'result-correct'
                                                    buttonText = 'Má být správně';
                                                }
                                            }

                                            return (

                                                <div key={answer._id}>
                                                    <div onClick={() => handleSelectAnswer(currentQuestion._id, answer._id, answer.correct)} className={buttonClassName}>
                                                        <div>{answer.text}</div>
                                                        <div className={resultClassName}>{buttonText}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {showHintNote && (
                                            <div className="hintnote">
                                                <p><XCircleFill /><span className='result-wrong'>Špatně</span>{data.getAllQuestionsWithAnswers[currentQuestionIndex].hintnotes[0].text}</p>
                                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                :
                                <div>
                                    <div className='time-out'>Časový limit 30 sekund na otázku vypršel. Přejdi za další otázku.</div>
                                    {
                                        !isLastQuestion ?
                                            <Button variant="primary" onClick={handleNextQuestion} className='wizard-btn'>
                                                další otázka
                                            </Button>
                                            :
                                            <Button variant="primary" onClick={handleFinish} className='wizard-btn'>
                                                Finish
                                            </Button>
                                    }
                                </div>
                        )
                        }

                        {finished &&
                            <div>
                                <div className='score-header'>
                                    Skóre: {score}%
                                </div>
                                <div className='score-text'>
                                    {numCorrectAnswers} z {data.getAllQuestionsWithAnswers.length} otázek máš správně
                                </div>
                            </div>
                        }

                        {showBtnNext ?
                            (!isLastQuestion ? (
                                <Button variant="primary" onClick={handleNextQuestion} className='wizard-btn'>
                                    další otázka <ArrowRight />
                                </Button>
                            ) : (
                                finished ?
                                    <Button variant="light" onClick={handleReset} className='reset-btn'>
                                        zkusit znovu
                                    </Button>
                                    :
                                    <Button variant="primary" onClick={handleFinish} className='wizard-btn'>
                                        dokončit kvíz
                                    </Button>
                            ))
                            :
                            null
                        }
                    </div>
                </div>
            </Container>
        </main>
    );
}

export default App;