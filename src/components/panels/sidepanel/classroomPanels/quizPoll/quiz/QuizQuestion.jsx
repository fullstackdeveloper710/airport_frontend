import React, { Fragment, useState, useEffect } from 'react';
import { BorderedButton } from 'components/common/BorderedButton';
import { ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup';
import { useDispatch, useSelector } from 'react-redux';
import { setSidePanelKey, setSidePanelName } from 'store/reducers/sidePanel'
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const quizExample = [
    {
        id: 1,
        text: "This is the first question",
        options: [
            {
                key: "opt_1",
                text: "Option 1"
            },
            {
                key: "opt_2",
                text: "Option 2"
            },
            {
                key: "opt_3",
                text: "Option 3"
            },
            {
                key: "opt_4",
                text: "Option 4"
            }
        ]
    },
    {
        id: 2,
        text: "This is the second question",
        options: [
            {
                key: "opt_1",
                text: "Option 1"
            },
            {
                key: "opt_2",
                text: "Option 2"
            },
            {
                key: "opt_3",
                text: "Option 3"
            }
        ]
    },
    {
        id: 3,
        text: "This is the third question",
        options: [
            {
                key: "opt_1",
                text: "Option 1"
            },
            {
                key: "opt_2",
                text: "Option 2"
            }
        ]
    },
    {
        id: 4,
        text: "This is the fourth question",
        options: [
            {
                key: "opt_1",
                text: "Option 1"
            },
            {
                key: "opt_2",
                text: "Option 2"
            },
            {
                key: "opt_3",
                text: "Option 3"
            },
            {
                key: "opt_4",
                text: "Option 4"
            },
            {
                key: "opt_5",
                text: "Option 5"
            }
        ]
    },
    {
        id: 5,
        text: "This is the fifth question",
        options: [
            {
                key: "opt_1",
                text: "Option 1"
            },
            {
                key: "opt_2",
                text: "Option 2"
            },
            {
                key: "opt_3",
                text: "Option 3"
            },
            {
                key: "opt_4",
                text: "Option 4"
            }
        ]
    },
]

export const QuizQuestionPanel = () => {
    const {
        components: {
            layout: { navigation: ls },
        },
    } = useLabelsSchema();
    const [answerChoices, setAnswerChoices] = useState({})
    const [questions, setQuestions] = useState(null)
    const dispatch = useDispatch()

    const { quiz } = useSelector(state => state)

    useEffect(() => {
        let answersList = {}
        for (let i = 0; i < quizExample.length; i++) {
            answersList[quizExample[i].id] = null
        }
        setAnswerChoices(answersList)
    }, [quizExample])

    useEffect(() => {
        const currentQuiz = quiz.currentQuiz.quiz
        const quizQuestions = currentQuiz.quizQuestions
        const questionsArray = quizQuestions?.map(quest => {
            return {
                id: quest.id,
                text: quest.question,
                options: quest.quizAnswers.map(ans => {
                    return {
                        key: ans.id,
                        text: ans.answer
                    }
                })
            }
        })
        setQuestions(questionsArray)
    },[])

    const handleChoiceChange = (ev, option, questionId) => {
        const newAnswer = {}
        newAnswer[questionId] = option.key
        setAnswerChoices({ ...answerChoices, ...newAnswer })
    }

    const handleSubmitQuiz = () => {
        console.log("ANSWERS", answerChoices)
        dispatch(setSidePanelKey("quizResults"))
        dispatch(setSidePanelName(ls.listNav["quizResults"]))
    }

    return (
        <Fragment>
            <div className='virtualClassroom-quiz-question-form'>
                {
                    questions?.map((question, index) => {
                        return (
                            <div className='virtualClassroom-quiz-question-container' key={index}>
                                <div className='virtualClassroom-quiz-question-number'>
                                    <span>Question {index + 1}</span> of {questions.length}
                                </div>
                                <div className='virtualClassroom-quiz-question'>
                                    {question.text}
                                </div>
                                <div className='virtualClassroom-choice-grp'>
                                    <ChoiceGroup
                                        onChange={(ev, option) => handleChoiceChange(ev, option, question.id)}
                                        selectedKey={answerChoices[question.id]}
                                        options={question.options}
                                    />
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            <div className='virtualClassroom-confirm-btn'>
                <BorderedButton onClick={handleSubmitQuiz}>Submit</BorderedButton>
            </div>
        </Fragment>
    );
};