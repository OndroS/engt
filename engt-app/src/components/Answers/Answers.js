import React from 'react';
import { XCircleFill } from 'react-bootstrap-icons';
import './Answers.css'

const Answers = (props) => {
    
    return (
        <div className='answers'>
            {props.currentAnswers.map((answer) => {
                let buttonClassName = 'answer-btn';
                let buttonText;
                let resultClassName;
                if (props.userAnswers[props.currentQuestion._id]) {
                    if (answer._id === props.userAnswers[props.currentQuestion._id].answerId) {
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
                        <div onClick={() => props.handleSelectAnswer(props.currentQuestion._id, answer._id, answer.correct)} className={buttonClassName}>
                            <div>{answer.text}</div>
                            <div className={resultClassName}>{buttonText}</div>
                        </div>
                    </div>
                );
            })}
            {props.showHintNote && (
                <div className="hintnote">
                    <p><XCircleFill /><span className='result-wrong'>Špatně</span>{props.data.getAllQuestionsWithAnswers[props.currentQuestionIndex].hintnotes[0].text}</p>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. </p>
                </div>
            )}
        </div>
    )
}

export default Answers;