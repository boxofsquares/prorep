import React, { Component } from 'react';
import logo from './logo.svg';
import './App.scss';
import VoteSlider from './slider.js';
import Names from './names.json';

const TOTAL_VOTES = 100;
const NO_OF_REGIONS = 4;
const NO_OF_DISTRICTS = 4;
const NO_OF_REGION_SEATS = 2;
const VotingSystem = Object.freeze({ 
  FPTP: 0,
  MMP: 1,
});

class App extends Component {
  constructor(props) {
    super(props);
    this.initializeState()
    this.onRegionChange = this.onRegionChange.bind(this);
    this.toggleSystem = this.toggleSystem.bind(this);
  }

  initializeState() {
    // 1 province, 4 regions, 4 districts   
    this.state ={ regions: [] };
    for(let j = 1; j <= NO_OF_REGIONS; j++) {  
      let _region = { 
        regionId: j,
        regionAttr: Names.regions[j-1],
        districts: [] };  
      let _lower = (j-1) * NO_OF_DISTRICTS + 1;
      let _upper = _lower + NO_OF_DISTRICTS;
      for(let i = _lower; i < _upper; i++) {
        _region.districts.push({
          districtId: i,
          results: {
          blue: { 
            votes: 20,
          },
          red: {
            votes: 50,
          },
          green: {
            votes: 30,
          },
          }
        });
      }
      // TODO: This is hardcoded for now !!!
      _region["overall"] = {
        blue: 80,
        red: 200,
        green: 120,
        total: 400,
      }
      this.state.regions.push(_region);
      this.state.system = VotingSystem.FPTP;
    }
  }

  render() {
    return (
      <div className="App">
      <div id="left-pane">
        <div id="system-toggle">
          <button name="FPTP" className={"left-toggle " + (this.state.system == VotingSystem.FPTP ? "selected" : "")} onClick={this.toggleSystem}>
            FPTP
          </button>
          <button name="MMP" className={"right-toggle " + (this.state.system == VotingSystem.FPTP ? "" : "selected")} onClick={this.toggleSystem}>
            MMP
          </button>
        </div>
        <Parliament election={this.state} />
      </div>
       <div id="regions">
          <Region details={this.getDistrictsForRegion(1)} notifyParent={this.onRegionChange}/>
          <Region details={this.getDistrictsForRegion(2)} notifyParent={this.onRegionChange}/>
          <Region details={this.getDistrictsForRegion(3)} notifyParent={this.onRegionChange}/>
          <Region details={this.getDistrictsForRegion(4)} notifyParent={this.onRegionChange}/>
        </div>
      </div>
    );
  }

  getDistrictsForRegion(region) {
    return this.state.regions[region - 1];
  }
  
  onRegionChange(regionState) {
    let _state = this.state;
    _state.regions[regionState.regionId - 1] = regionState;
    this.setState(_state);
  }

  toggleSystem(event) {
    let target = event.target;
    this.setState({
      system: VotingSystem[target.name],
    });
  }
}

class Parliament extends Component {

  render() {
    let { allSeats, overall } = this.getAllSeats();
    const { blue, red, green, total} = this.getPopularVote();
    let html = this.buildSeats(allSeats);
    return(
      <div id="parliament-wrapper">
        <h1>Parliament</h1>
        <div id="parliament">
        { html }
        </div>
        <div id="legend">
          <span className="district">District Seat</span>
          <span className="region">Region Seat</span>
        </div>
        <div id="parliament-breakdown">
          <div></div>
          <h3 className="popular">Popular Vote</h3>
          <h3 className="representation">Representation</h3>
          <h3 className="title blue">Blue Party</h3>
          <div className="percentage blue">{`${(blue / total * 100).toPrecision(4)}%`}</div>
          <div className="percentage blue">{`${(overall.blue / overall.total * 100).toPrecision(4)}%`}</div>
          <h3 className="title red">Red Party</h3>
          <div className="percentage red">{`${(red / total * 100).toPrecision(4)}%`}</div>
          <div className="percentage red">{`${(overall.red / overall.total * 100).toPrecision(4)}%`}</div>
          <h3 className="title green">Green Party</h3>
          <div className="percentage green">{`${(green / total * 100).toPrecision(4)}%`}</div>
          <div className="percentage green">{`${(overall.green / overall.total * 100).toPrecision(4)}%`}</div>
        </div>
      </div>
    )
  }

  getAllSeats() {
    const { regions } = this.props.election;
    let acc = regions.reduce((acc, region) => {
      let allSeats = [];
      let seatsByParty = {blue: 0, red: 0, green: 0, total: 0};
      for (let district of region.districts) {
        let winner = this.getWinner(district)["party"];
        allSeats.push(
          {
            districtId: district.districtId,
            type: "direct",
            party: winner,
          }
        );
        seatsByParty[winner] += 1;
        seatsByParty.total += 1;
      }
      // acc.allSeats.push(...directSeats);
      if (this.props.election.system === VotingSystem.MMP) {
        let results = this.distributeRegionalSeats(allSeats,seatsByParty, region);
        allSeats = results.allSeats;
        seatsByParty = results.seatsByParty;
      }
      acc.allSeats.push(... allSeats);
      ["blue","red","green","total"].forEach((party) => {
        acc.overall[party] += seatsByParty[party];  
      });
      return acc;
    }, { allSeats: [], overall: { blue: 0, red: 0, green: 0, total: 0}})
    return acc;
  }

  buildSeats(allSeats) {
    return allSeats.map((seat) => {
      return (
        <div id={seat.districtId} className={'seat ' + seat.party + " " + seat.type}></div>
      )
    });
  }

  getWinner(districtObj) {
    return Object.keys(districtObj.results).reduce((acc, _party) => {
      if (districtObj.results[_party].votes > acc.votes) {
        return {party: _party, votes: districtObj.results[_party].votes }
      } else {
        return acc;
      }
    }, {party: "", votes: 0 })
  }

  distributeRegionalSeats(directSeats, seatsByParty, regionObj) {
    let { overall } = regionObj;
    // let allSeats = directSeats.reduce((acc, districtSeat) => {
    //   acc[districtSeat.party] += 1;
    //   return acc;
    // }, { blue: 0, red: 0, green: 0 })
    let regionSeats = []
    for(let i = 0; i < NO_OF_REGION_SEATS; i++) {
      let delta = ["blue","red","green"].reduce((acc, party) => {
        let margin = seatsByParty[party] /  (directSeats.length + NO_OF_REGION_SEATS) - overall[party] / 100 ;
        if (margin < 0) {
          if (margin < acc.d) {
            acc = { party: party, d: margin};
          }
        }
        return acc;
      }, {party: "", d: 0});
      seatsByParty[delta.party] += 1;
      seatsByParty.total += 1;
      regionSeats.push({
          districtId: 0,
          type: "region",
          party: delta.party,
      })
    }
    return { allSeats: [... directSeats, ...regionSeats], seatsByParty: seatsByParty };
  }

  getPopularVote() {
    const { regions } = this.props.election;
    return regions.reduce((acc, region) => {
      ["blue","red","green","total"].forEach((party) => {
        acc[party] += region.overall[party];
      });
      return acc;
    }, { blue: 0, red: 0, green: 0, total: 0});
  }
}

class Region extends Component {
  constructor(props) {
    super(props);
    this.onDistrictChange = this.onDistrictChange.bind(this);
  }

  render() {
    let details = this.props.details;
    return (
      <div className="region">
        <h1>{details.regionAttr.regionName}</h1>
        <div className="districts">
        <District details={details.districts[0]} name={details.regionAttr.districts[0]} notifyParent={this.onDistrictChange}/>
        <District details={details.districts[1]} name={details.regionAttr.districts[1]} notifyParent={this.onDistrictChange}/>
        <District details={details.districts[2]} name={details.regionAttr.districts[2]} notifyParent={this.onDistrictChange}/>
        <District details={details.districts[3]} name={details.regionAttr.districts[3]} notifyParent={this.onDistrictChange}/>

        </div>
        {this.displayVoteBar()}
      </div>
    );
  }

  displayVoteBar() {
    let overall = this.props.details.overall;
    let _total = this.props.details.overall.total;
    return (
      <div className="vote-bar">
        <div className="vote-bar-blue" style={{width: overall["blue"]/_total * 100 + "%"}}>
        </div>
        <div className="vote-bar-red" style={{width: overall["red"]/_total * 100 + "%"}}>
        </div>
        <div className="vote-bar-green" style={{width: overall["green"]/_total * 100 +"%"}}>
        </div>
      </div>
    )
  }

  calculateOveralls(regionState) {
    let overall = regionState.districts.reduce((acc, district) => {
      for( let party of ["blue","red","green"]) {
        acc[party] += district.results[party].votes;
        acc.total += district.results[party].votes;
      }
      return acc;
    }, { blue: 0, red: 0, green: 0, total: 0});
    return overall;
  }

  onDistrictChange(districtState) {
    let _regionState = this.props.details;
    _regionState[districtState.districtId] = districtState;
    _regionState["overall"] = this.calculateOveralls(_regionState);
    this.props.notifyParent(
      _regionState
    );
  }
}

class District extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locked: {
        red: false,
        blue: false,
        green: false,
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
  }
  
  render() {
    const { results } = this.props.details;
    const { locked } = this.state;

    return (
      <div className={"district " + this.getWinner()["party"]}>
        <h2>{this.props.name}</h2>
        {/* <label>Party Blue</label>
        <input name="blue-votes" type="range" min="0" max="100" value={results.blue.votes} onChange={this.handleChange} /> */}
        <VoteSlider low={results.blue.votes} high={results.blue.votes + results.red.votes} handleChange={this.handleSliderChange}/>
        {/* <span>{results.blue.votes + '%'}</span> 
        <input name="blue-locked" type='checkbox' checked={locked.blue}  onChange={this.handleChange} />
        <label>Party Red</label>
        <input name="red-votes" type="range"  min="0" max="100" value={results.red.votes} onChange={this.handleChange} />
        <span>{results.red.votes + '%'}</span> 
        <input name="red-locked" type='checkbox' checked={locked.red}  onChange={this.handleChange} />
        <label>Party Green</label>
        <input name="green-votes" type="range"  min="0" max="100" value={results.green.votes} onChange={this.handleChange} />
        <span>{results.green.votes + '%'}</span> 
        <input name="green-locked" type='checkbox' checked={locked.green}  onChange={this.handleChange} /> */}
      </div>
    );
  }

    // Handlers
    handleSliderChange({ low, high }) {
      const { notifyParent } = this.props;
      let { districtId, results } = this.props.details;
      results.blue.votes = low;
      results.red.votes = high - low;
      results.green.votes = 100 - high;

      notifyParent({ districtId, results });
    }

    handleChange(event) {
      let target = event.target;
      let tags = event.target.name.split('-');
      let party = tags[0];
      let key = tags[1];
      
      let details = this.props.details;
      let partyObj = details.results[party];
      let locked = this.state.locked;

      switch(key) {
        case 'locked':
          let _locked = this.state.locked;
          locked[party] = target.checked;
          this.setState(_locked);
          break;
        case 'votes':
          let value = event.target.value == "" ? 0 : parseInt(target.value);
          
          let benefactors = Object.keys(details.results).filter((_party) => {
            return !locked[_party] && _party != party;
          });
          
          if (benefactors < 1) {
            break;
          }
  
          // check total seats bound
          let lockedVotes = Object.keys(details.results).reduce((acc, _party) => {
            if (party != _party && locked[_party]) {
              acc += details.results[_party].votes;
            }
            return acc;
          }, 0);
          
          let remainder = TOTAL_VOTES - (value + lockedVotes);
          if (remainder >= 0) {
            partyObj[key] = value;
            details.results[party] = partyObj;
            let updates = this.distributeRemainder(party, remainder);
            details.results = {...details.results, ...updates};
          }
          this.props.notifyParent(details);
          break;
        default:
      }
      
    }
  
    distributeRemainder(party, remainder) {
      let details = this.props.details;
      let benefactors = Object.keys(details.results).filter((_party) => {
        return !this.state.locked[_party] && _party != party;
      });
  
      let distVotes = Math.floor(remainder / benefactors.length);
      let overflow =  remainder % benefactors.length;
      let updates = benefactors.reduce((obj, _party) => {
        let partyObj = details.results[_party];
        partyObj.votes = distVotes;
        if (overflow > 0 ) {
          partyObj.votes++;
          overflow--;
        }
        obj[_party] = partyObj;
        return obj;
      }, {});
      return updates;
    }

    getWinner() {
      let _results = this.props.details.results;
      return ["blue","red","green"].reduce((acc, _party) => {
        if (_results[_party].votes > acc.votes) {
          return {party: _party, votes: _results[_party].votes }
        } else {
          return acc;
        }
      }, {party: "", votes: 0 })
    }
}

export default App;
