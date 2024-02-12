import React, { useEffect,useState,useCallback } from 'react';
import { Dropdown } from '@fluentui/react';
import { BorderedButton } from 'components/common/BorderedButton';
import { ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup';
import { useDispatch, useSelector } from 'react-redux';
import { setPanelName, openPanel } from 'store/reducers/panel';
import classroomService from 'services/classroomService';
import { setCurrentQuiz } from 'store/reducers/quiz';

const dropdownStyles = { dropdown: { width: 200 } };
const filter = [
  { key: 'recent', text: 'Recent' },
  { key: 'a-z', text: 'A - Z' },
  { key: 'z-a', text: 'Z - A' },
];
export const LoadQuiz = ({ dismissPanel }) => {

  const [quizList, setQuizList] = useState([])
  const [loadQuizOptions, setLoadQuizOptions] = useState([])
  const [choiceValue, setChoiceValue] = useState(null);
  const [order, setOrder] = useState('z-a')

  const dispatch = useDispatch();

  const handleLoadQuiz = async () => {
    const agendaId = 70
    const programId = 1
    const quiz = await classroomService.loadQuiz(programId, choiceValue, agendaId)
    dispatch(setCurrentQuiz({
      quizLoadId : quiz?.quizLoadId,
      quizId: quiz?.id,
      programId: quiz?.program?.id
    }))
    dispatch(setPanelName('quiz_results'));
    dispatch(openPanel(true));
  };

  useEffect(() => {
    const getProgramQuizzes = async (programId) => {
      const quizzes = await classroomService.getProgramQuizzes(programId)
      setQuizList(quizzes)
    }
    getProgramQuizzes(1)
  }, [])

  useEffect(() => {
    const sortQuizzes = (quizzes) => {
      switch (order) {
        case 'a-z':
          return quizzes.sort((a, b) => (a.name.toString() < b.name.toString() ? -1 : 1))
        case 'z-a':
          return quizzes.sort((a, b) => (a.name.toString() < b.name.toString() ? 1 : -1))
        default:
          return quizzes
      }
    }
    const sortedQuizList = sortQuizzes([...quizList])
    const quizzesOptions = sortedQuizList.map(quiz => {
      return {
        key: quiz.id,
        text: quiz.name
      }
    })
    setLoadQuizOptions(quizzesOptions)
  }, [order, quizList])
  return (
    <div className="panelContainer load">
      <div className="heading">
        <div className="header">Load a quiz</div>
        <div className="filter">
          <Dropdown
            onChange={(ev, option) => {
              setOrder(option.key)
            }}
            placeholder="Select an option"
            options={filter}
            styles={dropdownStyles}
            defaultSelectedKey="recent"
          />
        </div>
      </div>
      <div className="list">
        <ChoiceGroupControlledExample loadQuizOptions={loadQuizOptions} setChoiceValue={setChoiceValue} choiceValue={choiceValue} />
      </div>
      <div className="buttonSection">
        <BorderedButton onClick={dismissPanel}>Cancel</BorderedButton>
        <BorderedButton onClick={handleLoadQuiz} active={true}>
          Load and share
        </BorderedButton>
      </div>
    </div>
  );
};

export const ChoiceGroupControlledExample = ({ loadQuizOptions, setChoiceValue, choiceValue }) => {

  const onChange = useCallback((ev, option) => {
    setChoiceValue(option.key);
  }, []);
  return (
    <>
      {loadQuizOptions.length > 0 && <ChoiceGroup
        onChange={onChange}
        selectedKey={choiceValue}
        options={loadQuizOptions}
      />
      }
    </>
  );
};
