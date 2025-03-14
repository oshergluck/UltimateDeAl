import {logoOfWebsiteCoin} from '../assets'
const FallingBlock = ({ size, position,rotation  }) => {
    return (
        <div className='falling-block'>
            <div 
        className="absolute linear-gradient-gold rounded-[150px] drop-shadow-md" 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `rotateY(${rotation}deg)`,
          transition: 'transform 0.1s linear',
        }}
      >
      <div 
        className="absolute linear-gradient-gold rounded-[150px] drop-shadow-md" 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div 
          className="absolute linear-gradient-silver rounded-[150px]" 
          style={{
            width: `${size - 10}px`,
            height: `${size - 10}px`,
            left: '5px',
            top: '5px',
          }}
        >
          <img 
            src={logoOfWebsiteCoin} 
            className="absolute" 
            style={{
              width: `${size - 15}px`,
              height: `${size - 15}px`,
            }}
          />
          <span 
            className="absolute font-bold text-[#C0C0C0] drop-shadow"
            style={{
              fontSize: `${size / 4}px`,
              left: `${size / 2-10}px`,
              top: `${size / 2-19}px`,
            }}
          >
            1
          </span>
          </div>
        </div>
      </div>
      </div>
    );
  };

  export default FallingBlock;