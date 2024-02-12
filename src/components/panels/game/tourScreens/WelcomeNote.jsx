import { useLabelsSchema } from 'i18n/useLabelsSchema';
const Screen1 = ({ open, step, setStep, setOpen }) => {
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();
  return (
    <div className="tourSplash">
      <div className="tourSplash__Overlay blur"></div>
      <div className="tourSplash__scrollbar">
        <div className="tourSplash__container">
          <div className="tourSplash__welcomeNote">
            <h2>{ls.tour1.screen1.title}</h2>
            <p>{ls.tour1.screen1.content}</p>

            <button
              onClick={() => setStep((count) => count + 2)}
              type="button"
              className="btn-enter"
            >
              {ls.tour1.screen1.enterButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen1;
