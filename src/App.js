import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';

import './App.scss';
import './colors.scss';
import VoteSlider from './slider.js';
import Names from './names.json';
import Info from './info.json';
import logo from './vote_white.svg';
const NO_OF_REGIONS = 4;
const NO_OF_DISTRICTS = 4;
const NO_OF_REGION_SEATS = 2;
const VotingSystem = Object.freeze({ 
  FPTP: 0,
  MMP : 1,
});
const Preset = Object.freeze({
  None         : 0,
  TwoPartySplit: 1,
  Landslide    : 2,
  CloseRunnerUp: 3,
})

class App extends Component {
  constructor(props) {
    super(props);
    
    this.initializeState()

    // Binding Handlers
    this.onRegionChange     = this.onRegionChange.bind(this);
    this.toggleSystem       = this.toggleSystem.bind(this);
    this.toggleInfo         = this.toggleInfo.bind(this);
    this.hoverInfo          = this.hoverInfo.bind(this);
    this.randomizeVotes     = this.randomizeVotes.bind(this);
    this.handlePresetChange = this.handlePresetChange.bind(this);
  }

  initializeState() {
    // 1 province, 4 regions, 4 districts  
    this.state = { regions: [] };   
    this.state.system        = VotingSystem.FPTP;
    this.state.poptoggle     = false;
    this.state.popparliament = false;
    this.state.popslider     = false;
    this.state.preset        = 0;
    this.state.loading       = true;
  }

  componentDidMount() {
    this.randomizeVotes();
  }

  render() {
    let { toggleInfo, poptoggle, popslider, popparliament, preset, loading } = this.state;
    
    let infoBox; 
    infoBox = toggleInfo ? 
      <span className="info info-box">{Info.mmp}<span className="info-close" onClick={this.toggleInfo}>X</span></span> : 
      <span className="info info-tag" onClick={this.toggleInfo}>?</span>;
    
    return (
      <div className="App">
        <div id='top-bar' className="red-fill">
          <div id='logo' aria-label="prorep logo"><img src={logo} /><h2>ProRep</h2><span> Vote <i>YES</i> on the referendum!</span></div>
          <ul>
            <li>Please also check out:</li>
            <li className="link"><a href="https://elections.bc.ca/referendum">Elections BC</a></li>
            <li className="link"><a href="https://voteprbc.ca/get-informed">Vote PR BC</a></li>
            <li className="link"><a href="https://nobcprorep.ca">No BC ProRep<span role="img" aria-label="crying-emoji">😢</span></a></li>
          </ul>
        </div>
        <div id="left-pane">
          <div id='left-upper'>
            <div className='info-box-persistent'>
              <p>Hello!</p>
              <p>
                I hope you have landed on this site because you are looking to make an informed vote in ongoing BC referendum on proportional representation. 
                This little app was designed to aid your understanding of the proposed changes with a hands-on example.
              </p>
              <p>
                The {this.buildPopLink('toggle')} just below this box switches the seat allocation algorithm from First-Past-The-Post (FPTP) between Mixed-Member-Proportional (MMP), changing the make-up of {this.buildPopLink('parliament')}.
              </p>
                <p>The {this.buildPopLink('slider dials')} on the right are adjustable, so that one can configure different election outcomes for individual districts, also affecting the distributinon of seats in legislature.</p>
                <p>Have fun!</p>
            </div>
            <div id="system-toggle" className={poptoggle ? 'pop-out' : ''}>
              <button name="FPTP" className={"left-toggle " + (this.state.system === VotingSystem.FPTP ? "selected" : "")} onClick={this.toggleSystem}>
                FPTP
              </button>
              <button name="MMP" className={"right-toggle " + (this.state.system === VotingSystem.FPTP ? "" : "selected")} onClick={this.toggleSystem}>
                MMP
              </button>
              { infoBox }
            </div>
          </div>
          { loading ? <div>loading</div> :
            <Parliament className={popparliament ? 'pop-out' : ''} election={this.state} />
          }
        </div>
        { loading ? <div> loading</div> :
        <div id="regions">
          <div id='preset-select'>
            <ul>
              <li><h2>Presets:</h2></li>
              <li className={ 'btn ' + (preset === Preset.None ? 'red-fill' : '')} onClick={() => this.handlePresetChange(Preset.None)}>{'None'.toUpperCase()}</li>
              <li className={ 'btn ' + (preset === Preset.TwoPartySplit ? 'red-fill' : '')} onClick={() => this.handlePresetChange(Preset.TwoPartySplit)}>{'2 Party Split'.toUpperCase()}</li>
              <li className={ 'btn ' + (preset === Preset.Landslide ? 'red-fill' : '')} onClick={() => this.handlePresetChange(Preset.Landslide)}>{'Blue Landslide'.toUpperCase()}</li>
              <li className={ 'btn ' + (preset === Preset.CloseRunnerUp ? 'red-fill' : '')} onClick={() => this.handlePresetChange(Preset.CloseRunnerUp)}>{'Close Runner-Up'.toUpperCase()}</li>
            </ul>
            <div id='preset-info'>{ Info.presets[preset] }</div>
          </div>
          <div id='randomize' className='btn red-fill' onClick={this.randomizeVotes}>SHUFFLE VOTES</div>
          <Region details={this.getDistrictsForRegion(1)} notifyParent={this.onRegionChange} popSliders={popslider}/>
          <Region details={this.getDistrictsForRegion(2)} notifyParent={this.onRegionChange} popSliders={popslider} showInfo={true}/>
          <Region details={this.getDistrictsForRegion(3)} notifyParent={this.onRegionChange} popSliders={popslider}/>
          <Region details={this.getDistrictsForRegion(4)} notifyParent={this.onRegionChange} popSliders={popslider}/>
        </div>
        }
        <div id='bottom-bar' className="red-fill">
          <span>Made by <a href="https://github.com/boxofsquares">Jako {"\u25F3"}</a></span>
          <span className="credit">all icons used by Kiran from the Noun Project</span>
        </div>
      </div>
    );
  }

  getDistrictsForRegion(region) {
    return this.state.regions[region - 1];
  }
  
  onRegionChange(regionState) {
    let _state = this.state;
    _state.regions[regionState.id - 1] = regionState;
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

  hoverInfo(event) {
    const { target } = event;
    console.log(target.id.split(' ')[0]);
    let _newState = {
      ["pop" + target.id.split(' ')[0]]: !this.state["pop" + target.id.split(' ')[0]],
    };
    this.setState(_newState);
  }

  buildPopLink(text) {
    return  ( 
      <b id={text} className="pop-link red-text" onMouseOver={this.hoverInfo} onMouseLeave={this.hoverInfo}>{text}</b>
    );
  }

  randomizeVotes() {
    const { preset } = this.state;
    this.setState({ loading: true });
    let _regions = [];
    for(let j = 1; j <= NO_OF_REGIONS; j++) {  
      let _region = { 
        id  : j,
        regionAttr: Names.regions[j-1],
        districts : [],
        overall   : {
          blue : 0,
          red  : 0,
          green: 0,
          total: 0
        }
      };
      let _lower = (_region.id - 1) * NO_OF_DISTRICTS + 1;
      let _upper = _lower + NO_OF_DISTRICTS;

      for(let i = _lower; i < _upper; i++) {
        let point, range, _blue, _red, _green;

        switch(preset) {
          case Preset.None:
            point  = Math.floor(Math.random() * 101);
            range  = Math.floor(Math.min(point, 100 - point) * Math.random());
            _blue  = point - range;
            _red   = range * 2;
            _green = 100 - point - range;
            break;
          case Preset.TwoPartySplit:
            point  = Math.floor(Math.random() * 41) + 60;
            range  = Math.floor(Math.random() * 11);
            _blue  = Math.floor(point / 2) - 5 + range;
            _red   = point - _blue;
            _green = 100 - point; 
            break;
          case Preset.Landslide:
            point = Math.floor(Math.random() * 21) + 40;
            range = Math.floor(Math.random() * (100 - point));
            _blue = point;
            _red = range;
            _green = 100 - point - range;
            break;
          case Preset.CloseRunnerUp:
            point  = Math.floor(Math.random() * 41) + 60;
            range  = Math.floor(Math.random() * 11);
            _red   = Math.floor(point / 2) - 1 + range;
            _blue  = point - _red;
            _green = 100 - point;
            break;
          default:
        }


        // Normalize so that there is no even splits
        let arr = [_blue, _red, _green];
        
        for(let i = 0; i < 3; i++) {
          let collision = arr.slice(i).reduce((acc,count,index) => {
            if (arr[i] === count ) {
              acc = index;
            } else if (arr[i] < count) {
              acc = 0;
            }
            return acc;
          }, 0);
          
          if (collision > 0) {
            arr[i]++;
            arr[i + collision]--;
          }
          break;
        }

        [_blue, _red, _green] = arr;

        _region.districts.push({
          districtId: i,
          results   : {
            blue: { 
              votes: _blue,
            },
            red: {
              votes: _red,
            },
            green: {
              votes: _green,
            },
          }
        });

        _region.overall.blue  += _blue;
        _region.overall.red   += _red;
        _region.overall.green += _green;
        _region.overall.total += _blue + _red + _green;
      }

    _regions.push(_region);
    }
    this.setState({ regions: _regions, loading: false });
  }

  handlePresetChange(newPreset) {
    // preset needs to have reset before we can run randomizeVotes()
    // this is to avoid running randomizeVotes in each render because it will cause 
    // rerendering because of the intentional randomization
    const { preset } = this.state;
    if (newPreset === preset) return;
    this.setState({ preset: newPreset }, () => {this.randomizeVotes()});
  }
}

class Parliament extends Component {

  render() {
    let   { system }                 = this.props.election;
    let   { allSeats, overall }      = this.getAllSeats();
    const { blue, red, green, total} = this.getPopularVote();
    let   html                       = this.buildSeats(allSeats);
    let   baseOp                     = 1/2;
    return(
      <div className={this.props.className} id="parliament-wrapper">
        <h1>Parliament</h1>
        <div
          key={system}
          id="parliament">
          { this.buildSVG(allSeats) }
        </div>
        {/* { this.buildSVG(allSeats) } */}
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
            type      : "direct",
            party     : winner,
            uuid      : district.districtId,
          }
        );
        seatsByParty[winner] += 1;
        seatsByParty.total += 1;
      }
      // acc.allSeats.push(...directSeats);
      if (this.props.election.system === VotingSystem.MMP) {
        let results      = this.distributeRegionalSeats(allSeats,seatsByParty, region);
            allSeats     = results.allSeats;
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
        allSeats.map((seat) => {
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

   buildSVG(allSeats) {
    var seatWidth       = 20;
    var seatsPerRow     = 8;
    var baseRadius      = 2* seatsPerRow * seatWidth / Math.PI;
    var rows            = Math.floor(allSeats.length / seatsPerRow);
    var containerHeight = (rows + 1) * seatWidth * 2 + baseRadius;
    var containerWidth  = ((rows + 1) * seatWidth * 2 + baseRadius) * 2;
    var seats           = {
      blue : [],
      red  : [],
      green: []
    };

    for (let seat of allSeats) {
      seats[seat.party].push(seat);
    }

    let _allSeats = [ ...seats.blue, ...seats.red, ...seats.green ];
    let svgSeats = [];

    for (let i = 0; i < seatsPerRow * rows; i++) {
      let seat = _allSeats[i];
      let row = i % rows;
      let { x, y } = this.radialToCartesian(
        containerWidth / 2,
        containerHeight - 2* seatWidth,
        baseRadius + (seatWidth * 1.66 * row),
        (Math.floor(i / rows) + ((row % 2) - 1/2) / 2) * Math.PI  / (seatsPerRow - 1)
      );
      svgSeats.push(
        <CSSTransition
            timeout={600}
            key={seat.uuid}
            classNames="seat"
            in={true}
            appear={true}
            >
          <circle className={'seat ' + seat.party +"-fill-svg " + seat.type} cx={x} cy={y} r={seatWidth} />
        </CSSTransition>
      )
    }

    return (
      <svg id='svg-object' xmlns="http://www.w3.org/2000/svg" width={`${containerWidth}`} height={`${containerHeight}`} >
        { svgSeats }
      </svg>
    )
  }

  radialToCartesian(x,y,radius,radians) {
    let _x = x + Math.cos(radians) * radius;
    let _y = y - Math.sin(radians) * radius;
    return { x: _x, y: _y };
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
    let { overall, id } = regionObj;
    let regionSeats           = []
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
          type      : "region",
          party     : delta.party,
          uuid      : id * 100 + i,
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
    this.toggleInfo       = this.toggleInfo.bind(this);
    this.state            = { toggleInfo: false };
  }

  render() {
    let { popSliders, details, showInfo } = this.props;
    let { toggleInfo }                    = this.state;
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
        <District details={details.districts[0]} name={details.regionAttr.districts[0]} notifyParent={this.onDistrictChange} popSliders={popSliders}/>
        <District details={details.districts[1]} name={details.regionAttr.districts[1]} notifyParent={this.onDistrictChange} popSliders={popSliders} showInfo={showInfo}/>
        <District details={details.districts[2]} name={details.regionAttr.districts[2]} notifyParent={this.onDistrictChange} popSliders={popSliders}/>
        <District details={details.districts[3]} name={details.regionAttr.districts[3]} notifyParent={this.onDistrictChange} popSliders={popSliders}/>

        </div>
        {this.displayVoteBar()}
      </div>
    );
  }

  displayVoteBar() {
    let overall = this.props.details.overall;
    let _total  = this.props.details.overall.total;
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
    _regionState["overall"]                = this.calculateOveralls(_regionState);
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
    this.toggleInfo         = this.toggleInfo.bind(this);
  }
  
  render() {
    const { results }              = this.props.details;
    const { popSliders, showInfo } = this.props;
    const { toggleInfo }           = this.state;
    const winner                   = this.getWinner()["party"];

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
        <VoteSlider low={results.blue.votes} high={results.blue.votes + results.red.votes} handleChange={this.handleSliderChange} popSliders={popSliders}/>
      </div>
    );
  }

    // Handlers
    handleSliderChange({ low, high }) {
      const { notifyParent }        = this.props;
      let   { districtId, results } = this.props.details;
      
      results.blue.votes  = low;
      results.red.votes   = high - low;
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
