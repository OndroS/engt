import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import Question from './components/Question/Question';
import Answers from './components/Answers/Answers'

import { ArrowRight } from 'react-bootstrap-icons';
import { Button, Container, Navbar } from 'react-bootstrap';

const GET_DATA = gql`
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
     },
     getUserAnswers{
        userAnswers
        currentQuestionIndex
    } 
  }
`;

const ADD_USER_ANSWERS = gql`
  mutation createUserAnswers($userAnswers: JSONObject, $currentQuestionIndex:Int!) {
    createUserAnswers(userAnswers: {userAnswers: $userAnswers, currentQuestionIndex:$currentQuestionIndex}) {
        userAnswers
        currentQuestionIndex
    }
  }
`;

function App() {
    const { loading, error, data } = useQuery(GET_DATA);
    const [createUserAnswers, { dataa, loadingg, errorr }] = useMutation(ADD_USER_ANSWERS);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [loadedUserAnswers, setLoadedUserAnswers] = useState({});
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

    useEffect(() => {
        if (!loading && data) {
            setLoadedUserAnswers(data.getUserAnswers)
            console.log('setLoadedUserAnswers', data.getUserAnswers)
            if (data.getUserAnswers.userAnswers) {
                setIsPaused(true)
                setShowBtnNext(true)
                console.log('lol', JSON.parse(data.getUserAnswers.userAnswers))
                const obj = JSON.parse(data.getUserAnswers.userAnswers);
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const correctValue = obj[key].correct;
                        console.log('correctValue ', correctValue);
                        setShowHintNote(!correctValue)
                    }
                }
            }
        }
    }, [data, loadedUserAnswers]);

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

        let answerToSave = {
            ...userAnswers,
            [questionId]: {
                answerId,
                correct,
            },
        }

        handleSaveUserAnswers(JSON.stringify(answerToSave), currentQuestionIndex)
    };

    const handleSaveUserAnswers = (_userAnswers, _currentQuestionIndex) => {
        createUserAnswers({ variables: { userAnswers: _userAnswers, currentQuestionIndex: _currentQuestionIndex } });
    }

    const handleResetUserAnswers = () => {
        createUserAnswers({ variables: { userAnswers: {}, currentQuestionIndex: 0 } });
    }

    const handleNextQuestion = () => {
        setIsPaused(false)
        setTimeRemaining(30);
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setShowBtnNext(false)
        setShowHintNote(false)
    };

    const handleFinish = () => {
        setFinished(true)
        const score = calculateUserScore(userAnswers, data.getUserAnswers.userAnswers);
        setScore(score.scorePercentage)
        setNumCorrectAnswers(score.correctAnswers)
        setShowBtnNext(true)
        setShowHintNote(false)
        handleResetUserAnswers()
        setLoadedUserAnswers({})
        data.getUserAnswers = {}
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setTimeRemaining(30)
        setIsPaused(false)
        setFinished(false)
        setShowBtnNext(false)
        setShowHintNote(false)
        // handleResetUserAnswers()
        setLoadedUserAnswers({})
    };

    function calculateUserScore(_userAnswers, _loadedAnswers) {

        console.log('userAnswers', _userAnswers)
        console.log('_loadedAnswers', _loadedAnswers)

        let mergedObj = _userAnswers;

        if (_loadedAnswers) {
            mergedObj = {
                ..._userAnswers,
                ...JSON.parse(_loadedAnswers)
            };
        }

        console.log('mergedObj', mergedObj)

        const totalQuestions = Object.keys(data.getAllQuestionsWithAnswers).length;
        let correctAnswers = 0;

        for (const questionId in mergedObj) {
            if (mergedObj.hasOwnProperty(questionId)) {
                if (mergedObj[questionId].correct) {
                    correctAnswers++;
                }
            }
        }

        const scorePercentage = (correctAnswers / totalQuestions) * 100;
        return { scorePercentage, correctAnswers };
    }

    // console.log('lol', loadedUserAnswers.currentQuestionIndex !== undefined ?  loadedUserAnswers.currentQuestionIndex : currentQuestionIndex)

    let questionIndex = loadedUserAnswers.currentQuestionIndex ? loadedUserAnswers.currentQuestionIndex : currentQuestionIndex
    // console.log('questionIndex ', questionIndex)
    questionIndex = questionIndex > data.getAllQuestionsWithAnswers.length ? currentQuestionIndex : questionIndex
    const currentQuestion = data.getAllQuestionsWithAnswers[questionIndex].question;
    const currentAnswers = data.getAllQuestionsWithAnswers[questionIndex].answers;
    const isLastQuestion = questionIndex === data.getAllQuestionsWithAnswers.length - 1;

    return (
        <main className='App'>
            <Navbar className='header-navbar' expand="xxl">
                <div className='header'>
                    <div className='header-h1'>JavaScript: Node.js</div>
                    <div className='header-h2'>Lekce {questionIndex + 1} / {data.getAllQuestionsWithAnswers.length}: Základy</div>
                </div>
            </Navbar>
            <Container>
                <div className='box'>
                    <div className='question-box'>
                        {!finished &&
                            <div className='question-box-header'>
                                <div className='question-counter'>Otázka {questionIndex + 1} / {data.getAllQuestionsWithAnswers.length}</div>
                                <div className='question-counter'>Zbývá {timeRemaining} sekund</div>
                            </div>
                        }
                        {!finished && (
                            timeRemaining > 0 ?
                                <div>
                                    <Question question={currentQuestion} />
                                    {/* <code>var lol = 'lol';</code> */}
                                    {/* {console.log('userAnswers ',  Object.keys(userAnswers).length)} */}
                                    {/* {console.log('questionIndex ', questionIndex)} */}
                                    {/* {console.log('loadedUserAnswers.userAnswers ', loadedUserAnswers.userAnswers)} */}
                                    {/* {console.log('loadedUserAnswers ', loadedUserAnswers.userAnswers && JSON.parse(loadedUserAnswers.userAnswers))} */}
                                    <Answers
                                        data={data}
                                        currentAnswers={currentAnswers}
                                        userAnswers={Object.keys(userAnswers).length === 0 ? (loadedUserAnswers.userAnswers ? JSON.parse(loadedUserAnswers.userAnswers) : userAnswers) : userAnswers}
                                        currentQuestion={currentQuestion}
                                        currentQuestionIndex={questionIndex}
                                        showHintNote={showHintNote}
                                        handleSelectAnswer={handleSelectAnswer}
                                    />
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
                        )}

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