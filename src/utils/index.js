export const daysLeft = (endDate) => {
    // Convert the endDate from seconds to milliseconds
    const endDateInMilliseconds = endDate * 1000;
    
    // Calculate the difference in milliseconds between the endDate and the current time
    const difference = endDateInMilliseconds - Date.now();
  
    // Convert the difference from milliseconds to days
    const remainingDays = difference / (1000 * 3600 * 24);
  
    return remainingDays.toFixed(2);
  };  

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);
  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};
