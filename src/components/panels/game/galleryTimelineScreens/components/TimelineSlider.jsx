import React from 'react';
let yearsArray = [
  '1982',
  '1984',
  '1986',
  '1988',
  '1992',
  '1994',
  '1996',
  '1998',
  '2002',
  '2004',
  '2006',
  '2008',
  '2012',
  '2014',
  '2016',
  '2018',
  '2022',
  '2024',
  '2026',
  '2028',
];
let serialYears = ['1980', '1990', '2000', '2010', '2020', '2030'];
const TimelineSlider = ({ setIsActive, setYear }) => {
  const _getYear = (_y) => {
    setIsActive('year');
    setYear(_y);
  };
  return (
    <div className="custom_slider fadeInfadeOut">
      <div className="tob_border" />
      <div className="small_indicators_spans">
        {yearsArray.map((x, i) => {
          return (
            <span key={i} className="indicator" onClick={() => _getYear(x)} />
          );
        })}
      </div>
      <div className="counter_spans">
        {serialYears.map((x, i) => {
          return (
            <span key={i} onClick={() => _getYear(x)}>
              {x}
            </span>
          );
        })}
      </div>
    </div>
  );
};
export default TimelineSlider;
