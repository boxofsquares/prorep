import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import "./slider.scss";
import "./colors.scss";

class VoteSlider extends Component {
  constructor(props) {
    super(props);
    this.handleMouseUp         = this.handleMouseUp.bind(this);
    this.handleMouseDownLeft   = this.handleMouseDownLeft.bind(this);
    this.handleMouseDownRight  = this.handleMouseDownRight.bind(this);
    this.handleMouseMove       = this.handleMouseMove.bind(this);
    this.handleTouchStartLeft  = this.handleTouchStartLeft.bind(this);
    this.handleTouchStartRight = this.handleTouchStartRight.bind(this);
    this.handleTouchMove       = this.handleTouchMove.bind(this);
    this.handleTouchEnd        = this.handleTouchEnd.bind(this);
    this.state                 = {
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
          <div ref='sliderRail' className="slider-rail">
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
        this.verifyMove(screenX);
      }
    }
  }

  handleMouseMove({ screenX, relatedTarget }) {
    const { mouseDown, touchDown } = this.state;
    if (touchDown) return;
    if (!mouseDown) return;

    this.verifyMove(screenX); 
  }

  verifyMove(screenX, width) {
    const { xPos, dial } = this.state;
    const { low, high }  = this.props;
    let   _low           = low,
          _high          = high,
          _diff          = screenX - xPos,
          _railWidth     = this.refs.sliderRail.offsetWidth,
          _minIncrement  = 1,
          _delta         = Math.abs(Math.floor(_diff / _railWidth * 100));

    if (_delta < 1) return;

    if (_diff < 0) {
      if (dial === "left") {
        _low -= _delta;
        if (_low < 0) _low = 0;
        let validValue = this.checkBounds(_low, _high);
        if (!validValue) _low -= _minIncrement;
      } else {
        _high -= _delta;
        if (_high < _low) _high = _low;
        let validValue = this.checkBounds(_low, _high);
        if (!validValue) {
          if (_high - _minIncrement > _low) {
            _high -= _minIncrement;
          } else { return }
        }
      }
    } else if (_diff > 0) {
      if (dial === "left") {
        _low += _delta;
        if (_low > _high) _low = _high;
        let validValue = this.checkBounds(_low, _high);
        if (!validValue) {
          if (_low + _minIncrement < _high) {
            _low += _minIncrement;
          } else { return ;}
        }
      } else {
        _high += _delta;
        if (_high > 100) _high = 100;
        let validValue = this.checkBounds(_low, _high);
        if (!validValue) _high += _minIncrement;
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
      // dial: null,  // persist dial selection to be able to move 'last touched' dial
    });
  }

  getSliderConfigs() {
    const { low, high } = this.props;
    return {
      leftBar: {width: `${low}%` }, 
      middleBar: {width: `${high - low}%`},
      rightBar: {width: `${100-high}%`},
      lowDial: {
        ...(this.state.animationStart ? {left: `${low}%`} : {}),
        ...( this.state.dial === 'left' ? {zIndex: 1} : {})
      },
      highDial: {
        ...(this.state.animationStart ? {left: `${high}%`} : {}),
        ...(this.state.dial === 'right' ? {zIndex: 1 } : {})
      },
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