import React, { Component } from 'react';
import logo from './logo.svg';
import './App.scss';


const TOTAL_SEATS = 100;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blue: { 
        votes: 20,
        locked: false,
      },
      red: {
        votes: 50,
        locked: false,
      },
      green: {
        votes: 30,
        locked: false,
      },
    }
    this.handleChange = this.handleChange.bind(this); 
  }
  render() {
    return (
      <div className="App">
        <fieldset>
        <label>Party Blue</label>
        <input name="blue-votes" value={this.state.blue.votes} onChange={this.handleChange} />
        <input name="blue-locked" type='checkbox' checked={this.state.blue.lockedBlue}  onChange={this.handleChange} />
        </fieldset>
        <fieldset>
        <label>Party Red</label>
        <input name="red-votes" value={this.state.red.votes} onChange={this.handleChange} />
        <input name="red-locked" type='checkbox' checked={this.state.red.lockedRed}  onChange={this.handleChange} />
        </fieldset>
        <fieldset>
          <label>Party Green</label>
          <input name="green-votes" value={this.state.green.votes} onChange={this.handleChange} />
          <input name="green-locked" type='checkbox' checked={this.state.green.lockedGreen}  onChange={this.handleChange} />
        </fieldset>
        <Parliament results={this.state} />
      </div>
    );
  }

  // Handlers
  handleChange(event) {
    let target = event.target;
    let tags = event.target.name.split('-');
    let party = tags[0];
    let key = tags[1];

    let partyObj = this.state[party];

    switch(key) {
      case 'locked':
        partyObj[key] = target.checked;
        this.setState({[party]: partyObj});
        break;
      case 'votes':
        let value = event.target.value == "" ? 0 : parseInt(target.value);
        let remainder = TOTAL_SEATS - (value + this.calcOppositionTo(party));
        if (remainder >= 0) {
          partyObj[key] = value;
          this.setState({[party]: partyObj});
          this.distributeRemainder(party, remainder);
        }
        break;
      default:
    }
  }

  calcOppositionTo(party) {
    let _this = this;
    return Object.keys(this.state).reduce((acc, _party) => {
      if (party != _party ) {
        acc += _this.state[_party].votes;
      }
      return acc;
    }, 0);
  }

  distributeRemainder(party, remainder) {
    if (remainder == 0) {
      return;
    }

    let _this = this;
    let benefactors = Object.keys(this.state).filter((_party) => {
      return !_this.state[_party].locked && _party != party;
    })

    let distVotes = remainder / benefactors.length;
    let updates = benefactors.reduce((obj, _party) => {
      let partyObj = _this.state[_party];
      partyObj.votes += distVotes;
      obj[_party] = partyObj;
      return obj;
    }, {});

    this.setState(updates);
  }
}

class Parliament extends Component {
  render() {
    return(
      <div id="parliament">
      { this.getAllSeats() }
      </div>
    )
  }

  getAllSeats() {
    let allSeats = [];
    for (var party of Object.keys(this.props.results)) {
      for(var i = 0; i < this.props.results[party].votes; i++) {
         allSeats.push(
          <div className= { 'seat ' + party }></div>
        )
      }
    }
    return allSeats;
  }
}

export default App;
