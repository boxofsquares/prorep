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
    this.increment = 1;
    this.state = {
      xPos: null,
      mouseDown: false,
      dial: null,
      animationStart: false,
    };
  }

  render() {
    const { leftBar, middleBar, rightBar, lowDial, highDial } = this.getSliderConfigs();
    const { leftLabel, centerLabel, rightLabel } = this.getSliderLabels();
    return (
      <div 
        className="slider-container"
        onMouseUp={this.handleMouseUp} 
        onMouseLeave={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
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
                  className={"slider-dial"} 
                  style={lowDial} 
                  onMouseDown={this.handleMouseDownLeft}
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
                    className={"slider-dial"}  
                    style={highDial} 
                    onMouseDown={this.handleMouseDownRight} 
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
      let { screenX } = event;
      event.preventDefault();
      event.stopPropagation();
     this.setState({
      xPos: screenX,
      mouseDown: true, 
      dial: "left",
     });
  }

  handleMouseDownRight(event) {
    let { screenX } = event;
    event.preventDefault();
    event.stopPropagation();
    this.setState({
     xPos: screenX,
     mouseDown: true, 
     dial: "right",
    });
 }

  stopBubble(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  handleMouseUp() {
    this.resetDial();
  }

  handleMouseMove({ screenX }) {
    const { xPos, mouseDown, dial } = this.state;
    const { low, high } = this.props;
    if (!mouseDown) return; 
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