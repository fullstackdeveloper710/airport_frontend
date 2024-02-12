import React from 'react';
import { generateUuid } from 'utils/common';
import {
    ActionButton
} from 'office-ui-fabric-react';

import { BorderedButton } from 'components/common/BorderedButton';

import { Formik, Form, FieldArray } from 'formik';

import { TextInput } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { Icon } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { openSidePanel, setSidePanelKey, setSidePanelName } from 'store/reducers/sidePanel';
import { createAgendaPoll, setCurrentPoll } from 'store/reducers/polls';
import classroomService from 'services/classroomService';

const actionButtonStyles = {
    root: {},
    rootHovered: {
        opacity: '80%',
    },
    rootPressed: {
        opacity: '80%',
    },
    icon: {
        color: 'var(--sr-color-white)',
        fontSize: 22,
    },
};
const answerInputStyles = {
    wrapper: {
        display: 'flex',
        padding: '3px 0',
        alignItems: 'center',
        width: '100%',
    },
    fieldGroup: {
        background: 'var(--sr-color-transparent)',
        flexGrow: 1,
        marginLeft: '10px',
    },
    field: {
        '&::placeholder': {
            color: 'var(--sr-color-active)',
        },
    },
    root: {
        flexGrow: 1,
    },
    errorMessage: {
        fontFamily: 'var(--sr-font-primary)',
    },
};

const InnerForm = (props) => {
    const { values, dismissPanel } = props;
    const {
        components: {
            dialogs: { createPoolDialog: ls },
        },
    } = useLabelsSchema();

    const stopPropagation = (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    };
    return (
        <Form className='content'>
            <div className="formContent">
                <div className="formInput">
                    <div className="questionSection">
                        <label className='pollLabel'>Poll question</label>
                        <TextInput
                            placeholder={ls.textInputs.question.placeholder}
                            onKeyDown={stopPropagation}
                            onKeyUp={stopPropagation}
                            onKeyPress={stopPropagation}
                            name="question"
                        />
                    </div>
                    <div className="answersSection">
                        <label className='pollLabel'>Choices</label>
                        <FieldArray
                            name="answers"
                            render={(arrayHelpers) => (
                                <div className="answers">
                                    {values.answers.map((answer, index) => (
                                        <div key={index} className="ms-Flex">
                                            <TextInput
                                                className="input"
                                                placeholder={ls.textInputs.answers.placeholder}
                                                styles={answerInputStyles}
                                                onKeyDown={stopPropagation}
                                                onKeyUp={stopPropagation}
                                                onKeyPress={stopPropagation}
                                                name={`answers[${index}]`}
                                                suffix={
                                                    <span>
                                                        <Icon
                                                            iconName="Cancel"
                                                            className={`cancelIcon`}
                                                            onClick={() => arrayHelpers.remove(index)}
                                                        />
                                                    </span>
                                                }
                                            />
                                        </div>
                                    ))}
                                    <ActionButton
                                        iconProps={{ iconName: 'AddTo' }}
                                        onClick={(event) => {
                                            arrayHelpers.push('')
                                            const scrollDiv = event.target.parentNode
                                            scrollDiv.scrollTop = scrollDiv.scrollHeight
                                        }}
                                        color="white"
                                        title={ls.textInputs.createAnswerTitle}
                                        styles={actionButtonStyles}
                                    />

                                </div>
                            )}
                        />
                        <div className="buttonContainer">
                            <BorderedButton onClick={dismissPanel} >Cancel</BorderedButton>
                            <BorderedButton active={true} type="submit">Create and Share</BorderedButton>
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    )
}

export const Polls = (props) => {
    const { open, dismissPanel } = props;
    const {
        components: {
            dialogs: {
                createPoolDialog: { errorsQuestion, errorsAnswers },
            },
            layout: { navigation: ls },
        },
    } = useLabelsSchema();
    const dispatch = useDispatch()

    const onSubmit = async (values) => {
        const agendaId = 70
        const data = {
            question: values.question,
            pollOptions: values.answers.map((option, index) => {
                return {
                    optionName: option
                }
            })
        }
        const poll = await classroomService.createPoll(agendaId, data)
        dispatch(setCurrentPoll(poll))
        dispatch(setSidePanelKey("pollResults"))
        dispatch(setSidePanelName(ls.listNav["pollResults"]))
        dispatch(openSidePanel(true))
        dismissPanel();
    };

    const onDismiss = () => {
        console.log("Hey")
    }
    return (
        <div className="panelContainer createPolls">
            <div className="heading"><div className="header">
                Create a Poll
            </div></div>
            <Formik
                initialValues={{
                    question: '',
                    answers: [''],
                    isPublished: false,
                }}
                validate={(values) => {
                    const errors = {};

                    if (!values.question || !values.question.length) {
                        errors.question = errorsQuestion;
                    }

                    if (!values.answers || !values.answers.length) {
                        errors.answers = errorsAnswers;
                    }

                    return errors;
                }}
                onSubmit={onSubmit}
            >
                {(formProps) => (
                    <InnerForm open={open} onDismiss={onDismiss} dismissPanel={dismissPanel} {...formProps} />
                )}
            </Formik>
        </div>
    );
};
