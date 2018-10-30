import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import "./slider.scss";
import "./colors.scss";

class VoteSlider extends Component {
  constructor(props) {
    super(props);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDownLeft = this.handleMouseDownLeft.bind(this);
    this.handleMouseDownRight = this.handleMouseDownRight.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchStartLeft = this.handleTouchStartLeft.bind(this);
    this.handleTouchStartRight = this.handleTouchStartRight.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.increment = 1;
    this.state = {
      xPos: null,
      mouseDown: false,
      touchDown: false,
      touchIdentifier: null,
      dial: null,
      animationStart: false,
    };
  }

  render() {
    const { popSliders } = this.props;
    const { leftBar, middleBar, rightBar, lowDial, highDial } = this.getSliderConfigs();
    const { leftLabel, centerLabel, rightLabel } = this.getSliderLabels();
    return (
      <div 
        className="slider-container"
        onMouseUp={this.handleMouseUp} 
        onMouseLeave={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        >
        <div className="slider-rail">
        <div className="slider-bar-wrapper">
          <div className="slider-left blue-fill" style={leftBar} onMouseDown={this.stopBubble}>
          </div>
          <div className="slider-middle red-fill" style={middleBar} onMouseDown={this.stopBubble}>
          </div>
          <div className="slider-right green-fill" style={rightBar} onMouseDown={this.stopBubble}>
          </div>
          </div>
          <TransitionGroup>
              <CSSTransition
                timeout={1000}
                in={true}
                classNames="dial"
                appear={true}
                onEntering={() => {
                  this.setState({animationStart: true});
                }}
              >
                <div 
                  id={"left-dial"}
                  key={1}
                  className={"slider-dial " + (popSliders ? "pop-out" : "") } 
                  style={lowDial} 
                  onMouseDown={this.handleMouseDownLeft}
                  onTouchStart={this.handleTouchStartLeft}
                  >
                </div>
              </CSSTransition>
              <CSSTransition
                timeout={1000}
                in={true}
                classNames="dial"
                appear={true}
                onEntering={() => {
                  this.setState({animationStart: true});
                }}>
                  <div 
                    id={"right-dial"}
                    key={2}
                    className={'slider-dial ' + (popSliders ? 'pop-out' : '')}  
                    style={highDial} 
                    onMouseDown={this.handleMouseDownRight} 
                    onTouchStart={this.handleTouchStartRight}
                    >
                  </div>
              </CSSTransition>
            </TransitionGroup>
          </div>
        <div className="slider-legend">
          <div className="label-left blue-text">{leftLabel}</div>
          <div className="label-center red-text">{centerLabel}</div>
          <div className="label-right green-text">{rightLabel}</div>
        </div>
      </div>
    )
  }

  // Handlers
  handleMouseDownLeft(event) {
      const { touchDown } = this.state;
      let { screenX } = event;
      event.preventDefault();
      event.stopPropagation();

      if (touchDown) return;
     this.setState({
      xPos: screenX,
      mouseDown: true, 
      dial: "left",
     });
  }

  handleMouseDownRight(event) {
    const { touchDown } = this.state;
    let { screenX } = event;
    event.preventDefault();
    event.stopPropagation();

    if (touchDown) return;
    this.setState({
     xPos: screenX,
     mouseDown: true, 
     dial: "right",
    });
 }

  handleTouchStartLeft(event) {
    event.stopPropagation();
    const { touches } = event;
    const { mouseDown } = this.state;
    if (mouseDown) return;
    if (touches.length > 1) return;

    const {screenX, identifier } = touches[0];

    this.setState({
      touchDown: true,
      touchIdentifier: identifier,
      x: screenX,
      dial: "left",
    });
  }

  handleTouchStartRight(event) {
    event.stopPropagation();
    const { touches } = event;
    const { mouseDown } = this.state;
    if (mouseDown) return;
    if (touches.length > 1) return;

    const {screenX, identifier } = touches[0];

    this.setState({
      touchDown: true,
      touchIdentifier: identifier,
      x: screenX,
      dial: "right",
    });
  }

  stopBubble(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  handleMouseUp() {
    const {touchDown} = this.state;
    if (touchDown) return;
    this.resetDial();
  }

  handleTouchEnd() {
    const {mouseDown} = this.state;
    if (mouseDown) return;
    this.resetDial();
  }
  
  handleTouchMove(event) {
    const { changedTouches }= event;
    const { mouseDown, touchDown, touchIdentifier } = this.state;

    event.stopPropagation();
    if (mouseDown) return;
    if (!touchDown) return;
    for(let touch of changedTouches) {
      const { identifier, screenX } = touch;
      if (identifier === touchIdentifier) {
        console.log('in');
        this.verifyMove(screenX);
      }
    }
  }

  handleMouseMove({ screenX }) {
    const { mouseDown, touchDown } = this.state;
    if (touchDown) return;
    if (!mouseDown) return;
    this.verifyMove(screenX); 
  }

  verifyMove(screenX) {
    const { xPos, dial } = this.state;
    const { low, high } = this.props;
    let _low = low;
    let _high = high;
    if (screenX < xPos) {
      if (dial === "left") {
        _low -= this.increment;
        if (_low < 0) return
        let validValue = this.checkBounds(_low, _high);
        if (!validValue) _low -= this.increment;
      } else {
        _high -= this.increment;
        if (_high < _low) return;
        let validValue = this.checkBounds(_low, _high);
        if (!validValue) {
          if (_high - this.increment > _low) {
            _high -= this.increment;
          } else { return ;}
        }
      }
    } else if (screenX > xPos) {
      if (dial === "left") {
        _low += this.increment;
        if (_low > _high) return;
        let validValue = this.checkBounds(_low, _high);
        if (!validValue) {
          if (_low + this.increment < _high) {
            _low += this.increment;
          } else { return ;}
        }
      } else {
        _high += this.increment;
        if (_high > 100) return
        let validValue = this.checkBounds(_low, _high);
        if (!validValue) _high += this.increment;
      }
    }
    this.update({
      low: _low,
      high: _high,
    }, screenX)
  }


  // Helpers
  checkBounds(low, high) {
    return (
      (low < 1/3 * 100 || (low !== 100 - high && low !== high - low)) &&
      (100 - high < 1/3 * 100 || high - low !== 100 - high)
    );
  }

  resetDial() {
    this.setState({
      xPos: null,
      mouseDown: false,
      touchDown: false,
      touchIdentifier: null,
      dial: null,
    });
  }

  getSliderConfigs() {
    const { low, high } = this.props;
    return {
      leftBar: {width: `${low}%` }, 
      middleBar: {width: `${high - low}%`},
      rightBar: {width: `${100-high}%`},
      lowDial: this.state.animationStart ? {left: `${low}%`} : {},
      highDial: this.state.animationStart ? {left: `${high}%`} : {},
    }
  }

  getSliderLabels() {
    const { low,  high } = this.props;
    return {
      leftLabel: `${low}%`,
      centerLabel: `${high - low}%`,
      rightLabel: `${100 - high}%`,
    }
  }

  update(update, screenX) {
    const { handleChange } = this.props;
    let delta = Object.keys(update).some((key) => {
      return update[key] !== this.state[key]; 
    });
    if (delta) {
      handleChange(update);
      this.setState({
        xPos: screenX,
      })
    }
  }
}

export default VoteSlider;