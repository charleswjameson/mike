import React, { useState } from 'react';

import SplitPane, { Pane } from 'react-split-pane';
import { Slider, makeStyles } from '@material-ui/core';
import './App.css';

import MapView from './MapView';
import ControlView from './ControlView';

const useStyles = makeStyles(theme => ({
  root: {
  },
  leftPane: {
    width:"80%",
    margin: "auto",
    backgroundColor: "white",
  },
  rightPane: {
    width:"20%",
    backgroundColor: "lightgray",
  },
}));

function App() {
  const classes = useStyles();

  const [detail, setDetail] = useState("");

  const [isQuerying, setIsQuerying] = useState(false);



  return (
    <div className={classes.root}>
      
      <SplitPane split="vertical" defaultSize={650} primary="second">
        <MapView detail={detail} setDetail={setDetail}/>
        <ControlView region={detail} isQuerying={isQuerying} setIsQuerying={setIsQuerying}/>
      </SplitPane>
    </div>
  );
}

export default App;
