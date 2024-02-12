import React, { Fragment, useEffect, useState } from 'react';
import { ResultsProgressIndicator } from 'components/common/ResultsProgressIndicator';
import { useSelector } from 'react-redux';
import classroomService from 'services/classroomService';

const participantCount = 12

const quizResultsExample = [
    {
        id: 1,
        text: "This is the first question",
        options: [
            {
                text: "Option 1",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 2",
                ansCount: 3,
                isCorrect: true
            },
            {
                text: "Option 3",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 4",
                ansCount: 3,
                isCorrect: false
            }
        ]
    },
    {
        id: 2,
        text: "This is the second question",
        options: [
            {
                text: "Option 1",
                ansCount: 3,
                isCorrect: true
            },
            {
                text: "Option 2",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 3",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 4",
                ansCount: 3,
                isCorrect: false
            }
        ]
    },
    {
        id: 3,
        text: "This is the third question",
        options: [
            {
                text: "Option 1",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 2",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 3",
                ansCount: 3,
                isCorrect: true
            },
            {
                text: "Option 4",
                ansCount: 3,
                isCorrect: false
            }
        ]
    },
    {
        id: 4,
        text: "This is the fourth question",
        options: [
            {
                text: "Option 1",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 2",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 3",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 4",
                ansCount: 3,
                isCorrect: true
            }
        ]
    },
    {
        id: 5,
        text: "This is the fifth question",
        options: [
            {
                text: "Option 1",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 2",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 3",
                ansCount: 3,
                isCorrect: false
            },
            {
                text: "Option 4",
                ansCount: 3,
                isCorrect: true
            }
        ]
    }
]

const quizResults = {
    overAllScore: 4,
    quizResultsArr: quizResultsExample
}

export const QuizResults = () => {

    const [questions, setQuestions] = useState(null)
    const { quiz } = useSelector(state => state)
    useEffect(() => {
        const getQuizResults = async () => {
            const programId = quiz.currentQuiz.quiz.program.id
            const quizId = quiz.currentQuiz.quiz.id
            const quizLoadId = quiz.currentQuiz.id
            const quizResults = await classroomService.getQuizResultsForInvitee(programId, quizId, quizLoadId)
            const questionsArray = quizResults.quizQuestions
            setQuestions(questionsArray)
        }
        if (quiz.currentQuiz) {
            getQuizResults()
        }
    }, [])
    return (
        <Fragment>
            <div className='virtualClassroom-quiz-overallScore'>
                Overall score: {quizResults.overAllScore}/{quizResults.quizResultsArr.length}
            </div>
            <div className='virtualClassroom-quiz-results-wrapper'>
                {
                    questions?.map((question, index) => {
                        return (
                            <div key={question.id} className='virtualClassroom-quiz-results-container'>
                                <div className='virtualClassroom-quiz-question-number'>
                                    <span>Question {index + 1}</span> of {questions.length}
                                </div>
                                <div className='virtualClassroom-quiz-question'>
                                    {question.question}
                                </div>
                                <div className='virtualClassroom-progress-grp'>
                                    {
                                        question.quizAnswers?.map((quizOpt, index) => {
                                            return (
                                                <div className='virtualClassroom-progress-container' key={quizOpt.id}>
                                                    <div className='virtualClassroom-progress-label'>
                                                        <div className='virtualClassroom-progress-opt'>
                                                            {quizOpt.answer}
                                                        </div>
                                                        <div className='virtualClassroom-progress-percent'>
                                                            {'(' + quizOpt.userSelectedAnswerCount + ')' + ` ${(quizOpt.userSelectedAnswerCount * 100) / 20}` + '%'}
                                                        </div>
                                                    </div>
                                                    <div className={'virtualClassroom-progress-meter ' + (quizOpt.isCorrectAnswer ? "correct" : "incorrect")}>
                                                        <ResultsProgressIndicator percentComplete={(quizOpt.isCorrectAnswer) / 20} />
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </Fragment>
    );
};