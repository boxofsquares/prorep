import React, { Component } from 'react';
import "./slider.scss";

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
        onDragEnter={this.handleMouseUp}
        >
        <div className="slider-rail">
          <div className="slider-left" style={leftBar} onDragEnter={this.stopBubble}>
          </div>
          <div className="slider-middle" style={middleBar} onDragEnter={this.stopBubble}>
          </div>
          <div className="slider-right" style={rightBar} onDragEnter={this.stopBubble}>
          </div>
          <div 
            id={"left-dial"}
            className="slider-dial"
            style={lowDial} 
            onMouseDown={this.handleMouseDownLeft}
            >
          </div>
          <div 
            id={"right-dial"}
            className="slider-dial" 
            style={highDial} 
            onMouseDown={this.handleMouseDownRight} 
            // onMouseUp={this.handleMouseUp} 
            // onMouseOut={this.handleMouseUp}
            // onMouseMove={this.handleMouseMoveHigh}
            >
          </div>
        </div>
        <div className="slider-legend">
          <div className="label-left">{leftLabel}</div>
          <div className="label-center">{centerLabel}</div>
          <div className="label-right">{rightLabel}</div>
        </div>
      </div>
    )
  }

  // Handlers
  handleMouseDownLeft({ screenX }) {
     this.setState({
      xPos: screenX,
      mouseDown: true, 
      dial: "left",
     });
  }

  handleMouseDownRight({ screenX }) {
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

  // handleMouseMoveLow({ screenX }) {
  //   this.handleMouseMove(screenX, "left-dial");
  // }

  // handleMouseMoveHigh({ screenX }) {
  //   this.handleMouseMove(screenX, "right-dial");
  // }

  handleMouseMove({ screenX }) {
    const { xPos, mouseDown, dial } = this.state;
    const { low, high } = this.props;
    if (!mouseDown) return; 
    let _low = low;
    let _high = high;

    if (screenX < xPos) {
      if (dial === "left") {
        _low = _low - this.increment >= 0 ? _low - this.increment : _low;
      } else {
        _high = _high - this.increment >= _low ? _high - this.increment : _high;
      }
      if (_low >= 1/3 * 100 && _low == 100 - _high) {
        if (dial === "left") {
          _low = _low - this.increment;
        } else {
          _high = _high - this.increment;
        }
      }
    } else if (screenX > xPos) {
      if (dial === "left") {
        _low = _low + this.increment <= _high ? _low + this.increment : _low;
      } else {
        _high = _high + this.increment <= 100 ? _high + this.increment : _high;
      }
      if (_low >= 1/3 * 100 && _low == 100 - _high) {
        if (dial === "left") {
          _low = _low + this.increment;
        } else {
          _high = _high + this.increment;
        }
      }
    }
    this.update({
      low: _low,
      high: _high,
    }, screenX)
  }

  // Helpers
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
      lowDial: {left: `${low}%`},
      highDial: {left: `${high}%`},
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