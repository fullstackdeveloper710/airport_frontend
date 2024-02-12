import CheckedTour from './CheckedTour';
const TourSection = ({ onClick, title, item, setSubId }) => {
  return (
    <div className="tourBlock">
      <h2 className="tourBlock__heading">{title}</h2>
      <div className="tourBlock__row">
        {item.map((subItem, keyIndex) => {
          return (
            <CheckedTour
              key={keyIndex}
              isCompleted={subItem.userVirtualSubQuestStatus}
              onClick={() => {
                onClick(subItem.title);
                setSubId(subItem.id);
              }}
              landmarkImage={subItem.landmarkImage}
              title={subItem.title}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TourSection;
