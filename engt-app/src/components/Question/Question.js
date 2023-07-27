import React from 'react';
import './Question.css'

const Question = (props) => {
    return (
        <div className='question'>
            <div>
                <div className='question-text'>{props.question.text}</div>
            </div>
        </div>
    )
}

export default Question;