const DateDivider = ({ date }) => (
    <div className="flex items-center w-3/4 mx-auto mb-3">
      <div className="flex-grow border-t border-gray-300" />
      <span className="mx-4 text-gray-500 text-sm">{date}</span>
      <div className="flex-grow border-t border-gray-300" />
    </div>
  );
  
  export default DateDivider;
  