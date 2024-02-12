
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';

import { FontIcon, Icon } from '@fluentui/react/lib/Icon';
import { BorderedButton } from "components/common/BorderedButton";
import { useDispatch, useSelector } from "react-redux";
import classroomService from "services/classroomService";
import { setCurrentQuiz } from "store/reducers/quiz";

const dropdownStyles = { dropdown: { width: 200 } };


const dropdownControlledExampleOptions = [
    { key: 'default', text: 'Default' },
    { key: 'correct', text: 'Correct Responses' },
    { key: 'incorrect', text: 'Incorrect Responses' },
];


export const QuizResults = ({ dismissPanel }) => {

    const [questionResponses, setQuestionResponses] = useState(null)
    const [overViewData, setOverViewData] = useState(null)
    const dispatch = useDispatch()

    const { quiz } = useSelector(state => state)

    const handleShowResponses = (event) => {
        let quest = event.currentTarget
        let isOpen = quest.nextElementSibling.classList.contains('show')
        if (isOpen) {
            quest.querySelector('.caretDown').classList.remove('open')
            quest.nextElementSibling.classList.remove('show')
        }
        else {
            quest.querySelector('.caretDown').classList.add('open')
            quest.nextElementSibling.classList.add('show')
        }
    }

    const getQuizOverview = (quizQuestions) => {
        const responsesCount = {}
        quizQuestions?.forEach(quizQuestion => {
            quizQuestion.respondedUserAnswers.forEach(response => {
                if (responsesCount[response.id]) {
                    if (response.isCorrectAnswer) {
                        responsesCount[response.id].correctAnswerCount++
                    }
                    responsesCount[response.id].questions++
                }
                else {
                    responsesCount[response.id].user = response.name
                    responsesCount[response.id].correctAnswerCount = 0
                    responsesCount[response.id].questions = 1
                }
            })
        })
        console.log(responsesCount)
        setOverViewData(responsesCount)
    }

    useEffect(() => {
        const getQuizResultsTemplate = async () => {
            const programId = quiz.currentQuiz.programId
            const quizId = quiz.currentQuiz.quizId
            const quizLoadId = quiz.currentQuiz.quizLoadId
            const quizResults = await classroomService.getQuizResults(programId, quizId, quizLoadId)
            const quizQuestion = quizResults.quizQuestions
            setQuestionResponses(quizQuestion)
            getQuizOverview()
        }
        if (quiz.currentQuiz) {
            getQuizResultsTemplate()
        }
    }, [])


    const handleCloseQuiz = () => {
        const updateQuizStatus = async () => {
            const programId = quiz.currentQuiz.programId
            const quizLoadId = quiz.currentQuiz.quizLoadId
            const quizId = quiz.currentQuiz.quizId
            const res = await classroomService.updateQuizLoadStatus(programId, quizId, quizLoadId, "CLOSED")
            dispatch(setCurrentQuiz(null))
        }
        updateQuizStatus()
        dismissPanel()
    }

    return (
        <>
            <div className="panelContainer quizResult">
                <div className="heading">
                    <div className="header">Quiz Results</div>
                    <div className="filter">
                        <Dropdown
                            onChange={console.log("Here")}
                            placeholder="Select an option"
                            options={dropdownControlledExampleOptions}
                            styles={dropdownStyles}
                            defaultSelectedKey="default"

                        />
                    </div>
                </div>
                <div className="content resultsContainer">
                    {overViewData && <div className="questInfo">
                        <div className="questHeading" onClick={handleShowResponses}>
                            <div className="header">
                                Overview <Icon className="caretDown" iconName="ChevronDownSmall" />
                            </div>
                        </div>
                        <div className="questResponses">
                            {
                                Object.values(overViewData)?.map(result => {
                                    return <div className="questResponse"><div className="count">{result.correctAnswerCount}/{result.questions}</div>{result.user}</div>
                                })
                            }
                        </div>
                    </div>}
                    {
                        questionResponses?.map((question, index) => {
                            return <div className="questInfo">
                                <div className="questHeading" onClick={handleShowResponses}>
                                    <div className="header">
                                        <div className="count">
                                            Question {index + 1}<span className="light"> of {questionResponses.length}</span>
                                        </div>
                                        <Icon className="caretDown" iconName="ChevronDownSmall" />
                                    </div>
                                    <div className="subHeader">
                                        <div className="question">
                                            {question.question}
                                        </div>
                                        <div className="responseCount">
                                            <div className="result correct">Correct response: {question.correctAnswerCount}</div>
                                            <div className="result incorrect">Incorrect response: {question.inCorrectAnswerCount}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="questResponses">
                                    {
                                        question.respondedUserAnswers.map(response => {
                                            return <div className="questResponse"><Icon className="icon" iconName={response.isCorrectAnswer ? "CheckMark" : "Cancel"} />{response.iconName}</div>
                                        })
                                    }
                                </div>
                            </div>
                        })
                    }
                </div>
                <div className="buttonSection">
                    <BorderedButton onClick={handleCloseQuiz}>Close Quiz</BorderedButton>
                </div>
            </div>
        </>
    )
}