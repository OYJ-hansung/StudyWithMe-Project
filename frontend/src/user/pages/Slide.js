import React from "react";
import './Slide.css';
import hackerRank from '../../assets/hackerRank.jpg';
import helloAlgorithm from '../../assets/hello-algorithm.png';
import programmers from '../../assets/programmers.png';
import swea from '../../assets/swea.png';

import hackerRank_w from '../../assets/hackerRank-wide.jpg';
import helloAlgorithm_w from '../../assets/hello-algorithm-wide.png';
import programmers_w from '../../assets/programmers-wide.png';
import swea_w from '../../assets/swea-wide.png';

const images = [hackerRank_w, helloAlgorithm_w, programmers_w,swea_w];
const colors = ["#0088FE", "#00C49F", "#FFBB28"];
const delay = 2500;

function Slideshow() {
  const [index, setIndex] = React.useState(0);
  const timeoutRef = React.useRef(null);

  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  React.useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        ),
      delay
    );

    return () => {
      resetTimeout();
    };
  }, [index]);

  return (
    <div className="slideshow">
      <div
        className="slideshowSlider"
        style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
      >
        {images.map((image, index) => (
          <div
            className="slide"
            key={index}
            // style={{ backgroundColor }}
          >
            <img className="image-box" src={image}></img>
          </div>
        ))}
      </div>

      <div className="slideshowDots">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`slideshowDot${index === idx ? " active" : ""}`}
            onClick={() => {
              setIndex(idx);
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
export default Slideshow;