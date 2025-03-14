import React, { useState,useEffect } from 'react';

const StarRatingForNewReview = ({ rating, onRatingChange }) => {
  const [theRating, setTheRating] = useState(rating);
  const [hoverRating, setHoverRating] = useState(0); // State for hover effect

  useEffect(() => {
    setTheRating(rating);
  }, [rating]);

  const handleClick = (newRating) => {
    setTheRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (newRating) => {
    setHoverRating(newRating); // Update hover state for visual feedback
  };

  

  const handleMouseLeave = () => {
    setHoverRating(theRating); // Reset hover state on leave
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const starClass = `star ${
        i <= theRating ? 'filled' : (i <= hoverRating ? 'hover' : 'empty')
      }`;
      stars.push(
        <span
          key={i}
          className={starClass}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(i)}
        >
          &#9733;
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="star-rating">
      {renderStars()}
    </div>
  );
};

export default StarRatingForNewReview;
