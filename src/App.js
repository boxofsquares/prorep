import React, { Component } from 'react';
import {CSSTransition } from 'react-transition-group';

import './App.scss';
import './colors.scss';
import VoteSlider from './slider.js';
import Names from './names.json';
import Info from './info.json';

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

    // Binding Handlers
    this.onRegionChange = this.onRegionChange.bind(this);
    this.toggleSystem = this.toggleSystem.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
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
    }
    this.state.system = VotingSystem.FPTP;
  }

  render() {
    let { toggleInfo } = this.state;
    
    let infoBox; 
    infoBox = toggleInfo ? 
      <span className="info info-box">{Info.mmp}<span className="info-close" onClick={this.toggleInfo}>X</span></span> : 
      <span className="info info-tag" onClick={this.toggleInfo}>?</span>;
    
    return (
      <div className="App">
        <div id='top-bar' className="red-fill">
          <div id='logo'><h2>ProRep</h2><span> Vote <i>YES</i> on the referendum!</span></div>
          <ul>
            <li>Please also check out:</li>
            <li className="link"><a href="https://elections.bc.ca/referendum">Elections BC</a></li>
            <li className="link"><a href="https://voteprbc.ca/get-informed">Vote PR BC</a></li>
            <li className="link"><a href="https://nobcprorep.ca">No BC ProRep<span role="img" aria-label="crying-emoji">😢</span></a></li>
          </ul>
        </div>
        <div id="left-pane">
          <div id="system-toggle">
            <button name="FPTP" className={"left-toggle " + (this.state.system === VotingSystem.FPTP ? "selected" : "")} onClick={this.toggleSystem}>
              FPTP
            </button>
            <button name="MMP" className={"right-toggle " + (this.state.system === VotingSystem.FPTP ? "" : "selected")} onClick={this.toggleSystem}>
              MMP
            </button>
            { infoBox }
          </div>
          <Parliament election={this.state} />
        </div>
        <div id="regions">
          <Region details={this.getDistrictsForRegion(1)} notifyParent={this.onRegionChange}/>
          <Region details={this.getDistrictsForRegion(2)} notifyParent={this.onRegionChange} showInfo={true}/>
          <Region details={this.getDistrictsForRegion(3)} notifyParent={this.onRegionChange}/>
          <Region details={this.getDistrictsForRegion(4)} notifyParent={this.onRegionChange}/>
        </div>
        <div id='bottom-bar' className="red-fill">
          <span>Made by <a href="https://github.com/boxofsquares">Jako {"\u25F3"}</a></span>
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

  toggleInfo() {
    this.setState({toggleInfo : !this.state.toggleInfo})
  }
}

class Parliament extends Component {

  render() {
    let { system } = this.props.election;
    let { allSeats, overall } = this.getAllSeats();
    const { blue, red, green, total} = this.getPopularVote();
    let html = this.buildSeats(allSeats);
    let baseOp = 1/2;
    return(
      <div id="parliament-wrapper">
        <h1>Parliament</h1>
        
        <div
          key={system}
          id="parliament">
          { html }
        </div>
        <div id="legend">
          <span className="district"><span className="red-fill"></span>District Seat</span>
          <span className="region"><span className="red-fill">R</span>Region Seat</span>
        </div>
        <div id="parliament-breakdown">
          <h2 className="popular">Popular Vote</h2>
          <h2 className="representation">Representation</h2>
          <div className="percentage blue-fill" style={{transform: `scale(${this.getOpacity(blue, total, baseOp)})`}}>{`${(blue / total * 100).toPrecision(4)}%`}</div>
          <div className="percentage blue-fill" style={{transform: `scale(${this.getOpacity(overall.blue, overall.total, baseOp)})`}}>{`${(overall.blue / overall.total * 100).toPrecision(4)}%`}</div>
          <div className="percentage red-fill" style={{transform: `scale(${this.getOpacity(red, total, baseOp)})`}}>{`${(red / total * 100).toPrecision(4)}%`}</div>
          <div className="percentage red-fill" style={{transform: `scale(${this.getOpacity(overall.red, overall.total, baseOp)})`}}>{`${(overall.red / overall.total * 100).toPrecision(4)}%`}</div>
          <div className="percentage green-fill" style={{transform: `scale(${this.getOpacity(green, total, baseOp)})`}}>{`${(green / total * 100).toPrecision(4)}%`}</div>
          <div className="percentage green-fill" style={{transform: `scale(${this.getOpacity(overall.green, overall.total, baseOp)})`}}>{`${(overall.green / overall.total * 100).toPrecision(4)}%`}</div>
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
            uuid: district.districtId,
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
      acc.allSeats.push(...allSeats);
      ["blue","red","green","total"].forEach((party) => {
        acc.overall[party] += seatsByParty[party];  
      });
      return acc;
    }, { allSeats: [], overall: { blue: 0, red: 0, green: 0, total: 0}})
    return acc;
  }

  buildSeats(allSeats) {
    return (
        allSeats.map((seat, index) => {
          return (
            <CSSTransition
            timeout={600}
            key={seat.uuid}
            classNames="seat"
            in={true}
            appear={true}
            >
              <div className={'seat ' + seat.party +"-fill " + seat.type}>{ seat.type === 'region' ? 'R' : ''}</div>
           </CSSTransition>
          )
        })
    )
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
    let { overall, regionId } = regionObj;
    // let allSeats = directSeats.reduce((acc, districtSeat) => {
    //   acc[districtSeat.party] += 1;
    //   return acc;
    // }, { blue: 0, red: 0, green: 0 })
    let regionSeats = []
    for(let i = 0; i < NO_OF_REGION_SEATS; i++) {
      let delta = ["blue","red","green"].reduce((acc, party) => {
        let margin = seatsByParty[party] /  (directSeats.length + NO_OF_REGION_SEATS) - overall[party] / overall.total ;
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
          uuid: regionId * 100 + i,
      })
    }
    return { allSeats: [...directSeats, ...regionSeats], seatsByParty: seatsByParty };
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

  getOpacity(count, total, base) {
    return (count / total) * (1 - base) + base;
  } 
}

class Region extends Component {
  constructor(props) {
    super(props);
    this.onDistrictChange = this.onDistrictChange.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
    this.state = {
      toggleInfo: false,
    };
  }

  render() {
    let { showInfo, details } = this.props;
    let { toggleInfo } = this.state;
    let infoBox; 

    if (showInfo) {
      infoBox = toggleInfo ? 
        <span className="info info-box" >{Info.region}<span className="info-close" onClick={this.toggleInfo}>X</span></span> : 
        <span className="info info-tag" onClick={this.toggleInfo}>?</span>;
    }


    return (
      <div className="region">
        <div className="region-title-wrapper">
          <h1>{details.regionAttr.regionName}</h1>
          { infoBox }
        </div>
        <div className="districts">
        <District details={details.districts[0]} name={details.regionAttr.districts[0]} notifyParent={this.onDistrictChange}/>
        <District details={details.districts[1]} name={details.regionAttr.districts[1]} notifyParent={this.onDistrictChange} showInfo={showInfo}/>
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
        <div className="vote-bar-range blue-fill" style={{width: overall["blue"]/_total * 100 + "%"}}>
        </div>
        <div className="vote-bar-range red-fill" style={{width: overall["red"]/_total * 100 + "%"}}>
        </div>
        <div className="vote-bar-range green-fill" style={{width: overall["green"]/_total * 100 +"%"}}>
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

  toggleInfo() {
    this.setState({ toggleInfo: !this.state.toggleInfo });
  }
}

class District extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleInfo: false,
    }
    // this.handleChange = this.handleChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
  }
  
  render() {
    const { results } = this.props.details;
    const { showInfo } = this.props;
    const { toggleInfo } = this.state;
    const winner = this.getWinner()["party"];

    let infoBox; 
    if (showInfo) {
      infoBox = toggleInfo ? 
        <span className="info info-box" >{Info.district}<span className="info-close" onClick={this.toggleInfo}>X</span></span> : 
        <span className="info info-tag" onClick={this.toggleInfo}>?</span>;
    }

    return (
      <div className={"district " + winner + " border-bottom-" + winner}>
        <div className="district-title-wrapper">
          <h2>{this.props.name}</h2>
          { infoBox }
        </div>
        <VoteSlider low={results.blue.votes} high={results.blue.votes + results.red.votes} handleChange={this.handleSliderChange}/>
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

    toggleInfo() {
      this.setState({ toggleInfo: !this.state.toggleInfo });
    }
}

export default App;
