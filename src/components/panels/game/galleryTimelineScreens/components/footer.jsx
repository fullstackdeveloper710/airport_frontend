const TimelineStepper = ({ isActive, setIsActive }) => {
  const years = ['1980', '1990', '2000', '2010', '2020', '2030'];
  return (
    <div className="menu-dots">
      <ul>
        {years.map((_y, i) => {
          return (
            <li key={i} onClick={() => setIsActive(_y)}>
              <span
                className={
                  _y === isActive ? 'menu-indicator active' : 'menu-indicator'
                }
              />
              <p>{_y}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TimelineStepper;
