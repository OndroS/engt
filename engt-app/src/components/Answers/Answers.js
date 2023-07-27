import './Answers.css'
import React from 'react';
import { XCircleFill } from 'react-bootstrap-icons';
import DOMPurify from 'dompurify';

const Answers = (props) => {
    const { currentAnswers, currentQuestion, userAnswers, handleSelectAnswer, showHintNote, data, currentQuestionIndex } = props;

    return (
        <div className='answers'>
            {currentAnswers.map((answer) => {
                // Initialize variables with default values
                let buttonClassName = 'answer-btn';
                let buttonText = '';
                let resultClassName = '';

                // Check if the current answer is selected by the user
                if (userAnswers[currentQuestion._id]) {
                    const { answerId, correct } = userAnswers[currentQuestion._id];

                    if (answer._id === answerId) {
                        if (correct) {
                            buttonClassName = 'correct answer-btn';
                            resultClassName = 'result-correct';
                            buttonText = 'Správně';
                        } else {
                            buttonClassName = 'wrong answer-btn';
                            resultClassName = 'result-wrong';
                            buttonText = 'Špatně';
                        }
                    } else if (answer.correct) {
                        buttonClassName = 'correct answer-btn';
                        resultClassName = 'result-correct';
                        buttonText = 'Má být správně';
                    }
                }

                return (
                    <div key={answer._id}>
                        <div onClick={() => handleSelectAnswer(currentQuestion._id, answer._id, answer.correct)} className={buttonClassName}>
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(answer.text) }}></div>
                            <div className={resultClassName}>{buttonText}</div>
                        </div>
                    </div>
                );
            })}
            {showHintNote && (
                <div className="hintnote">
                    <p>
                        <XCircleFill /><span className='result-wrong'>Špatně</span>
                        {data.getAllQuestionsWithAnswers[currentQuestionIndex].hintnotes[0].text}
                    </p>
                </div>
            )}
        </div>
    );
}


export default Answers;