import './Question.css'
import React from 'react';
import DOMPurify from 'dompurify';

const Question = (props) => {

    return (
        <div className='question'>
            <div>
                <div className='question-text'>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.question.text) }}></div>
                </div>
            </div>
        </div>
    )
}

export default Question;