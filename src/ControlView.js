import React, { useState, useEffect } from 'react';
import { Slider, makeStyles, withStyles, CircularProgress } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SplitPane from 'react-split-pane';
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import RecalculateView from './RecalculateView';

const BAR_WIDTH = 17;

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#F2F2F2",
    height: "100%",
    display: 'flex',
    width: "100%",
  },
  centeredBox: {
    textAlign: "center",
    margin: "auto",
    padding: 20,
  },
  settingsList: {
    padding: 10,
    overflow: 'auto',
    maxHeight: "100%",
  },
  info: {
    margin: 10,
  },
  outerSettingsBox: {
    marginTop: 15,
    marginBottom: 15,
    display: 'flex',
    flexDirection: 'column',
  },
  innerSettingsBox: {
    height: 170,
    backgroundColor: "#FAFAFA",
    width: 'max-width',
    flexGrow: 100,
  },
  slider: {
    paddingLeft: 1,
    paddingRight: 1,
  },
  paper: {
    padding: theme.spacing(0),
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: "60%",
    width: { BAR_WIDTH },
    backgroundColor: 'transparent',
    boxShadow: 'none'
  },
  label: {
    padding: theme.spacing(1),
    textAlign: "right",
    color: theme.palette.text.secondary,
    height: "5%",
    width: { BAR_WIDTH },
    backgroundColor: 'transparent',
    boxShadow: 'none',
    fontSize: 10,
  },
}));


// used as vertical bar graph slider
const BarGraphSlider = withStyles({
  root: {
    color: "currentColor",
    height: 8,
    width: 8,
    // TODO: do something when hovering over the bar graph
    // good with detecting hovering, but can't find a way to change the ui that is graphically appealing
    "&$focusVisible,&:hover": {
      // borderColor:'black',
      // borderRadius:3,
      // backgroundColor:"#000000",
      // color:"#000000",
      // boxShadow: "inherit"
      // border: `1px solid ${theme.palette.divider}`,
    },
  },
  thumb: {
    height: { BAR_WIDTH },
    width: { BAR_WIDTH },
    backgroundColor: "transparent",
    left: 20, // BAR_WIDTH doesn't work
    // marginTop: -8,
    // marginLeft: -12,
    "&:focus,&:hover,&$active": {
      boxShadow: "inherit"
    },
    "& .bar": {
      height: 1,
      width: 9,
      backgroundColor: "#fff",
      marginLeft: 1,
      marginRight: 1,
      marginTop: 15
    },
  },
  vertical: {
    width: { BAR_WIDTH },
  },
  active: {},
  valueLabel: {},
  track: {
    '$vertical &': {
      width: 17,
      // change color to black when hovering
      // TODO: fix this, doesn't work all the time because of the thumb element blocking
      "&$focusVisible,&:hover": {
        backgroundColor: "#000000",
      }
    }
  },
  rail: {
    '$vertical &': {
      width: 17,
    }
  }
})(Slider);

function SliderThumbComponents(props) {
  return (
    <span {...props}>
      <span className="bar" />
    </span>
  );
}

function minVal(item) {
  if (item === "Temperature") return 30;
  return 0;
}

// found max values by going through clean data and using "df_conflict.groupby('Fatalities').max()" etc.
function maxVal(item) {
  if (item === "Temperature") return 120; // max in clean is 109.6
  if (item.includes("Fatalities")) return 700; // max in clean is 587
  if (item.includes("Maize")) return 40000; // max in clean is 36600
  if (item.includes("Rice")) return 30000; // max in clean is 25000, but max in raw is 60000
  if (item.includes("Sorghum")) return 40000;
  if (item.includes("Cowpeas")) return 100000; // max in clean is 80000
  return 100;
}

function BarGraphInput({ datapoint, color, label, disabled, name, cb }) {
  const classes = useStyles();

  const [value, setValue] = useState(datapoint);

  return (
    <div>
      <Paper className={classes.label}>
        {value}
      </Paper>
      <Paper className={classes.paper}>
        <BarGraphSlider
          ThumbComponent={SliderThumbComponents}
          orientation="vertical"
          valueLabelDisplay="auto"
          aria-label="bar graph slider"
          defaultValue={datapoint}
          style={{ "color": color }} //style={{"color":{color}}} doesn't work
          onChange={(_, v) => {
            setValue(v);
            cb(v);
          }}
          disabled={disabled}
          min={minVal(name)}
          max={maxVal(name)}
        />
      </Paper>
      <Paper className={classes.label}>{label}</Paper>
    </div>
  );
}

// creates vertical sliders with labels (e.g. for adjusting rainfall)
function GraphInput(props) {
  const classes = useStyles();
  let data = props.data;

  return (
    <div className={classes.root}>
      <Grid container spacing={0}>
        {data.map((x,i) => (
          // only allows the most recent 6 entries to be editable
          <BarGraphInput
            key={i} // remove this?
            datapoint={Math.round(x.value)}
            color={i > (data.length - 6) - 1 ? props.color : "grey"}
            label={x.label}
            disabled={i <= (data.length - 6) - 1}
            name={props.name}
            cb={x.cb} />
        ))}
      </Grid>
    </div>
  );
}

function includeUnitsInTitle(title) {
  if (title === "Temperature") return "Temperature: °F";
  if (title.includes("Maize") || title.includes("Rice") || title.includes("Sorghum") || title.includes("Cowpeas")) return title + ": SOS per kg";
  return title;
}

const MONTH_MAP = new Map([
  ["1", "Jan"],
  ["2", "Feb"],
  ["3", "Mar"],
  ["4", "Apr"],
  ["5", "May"],
  ["6", "Jun"],
  ["7", "Jul"],
  ["8", "Aug"],
  ["9", "Sep"],
  ["10", "Oct"],
  ["11", "Nov"],
  ["12", "Dec"],
]);

function ConvertYearMonthToGraphLabel(year, month) {
  return MONTH_MAP.get(month) + "'" + year.slice(-2);
}

function Dataset(props) {
  const classes = useStyles();

  return (
    <ExpansionPanel className={classes.outerSettingsBox} style={{ backgroundColor: props.backgroundColor }}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography className={classes.heading}>{includeUnitsInTitle(props.name)}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className={classes.innerSettingsBox}>
          <GraphInput key={props.name} data={props.data} color={props.backgroundColor} name={props.name} />
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

function chooseColor(item) {
  if (item === "Temperature") return "#65c8e6";
  if (item.includes("Fatalities")) return "#F55D5D";
  if (item.includes("Maize")) return "#fadd87";
  if (item.includes("Rice")) return "#85c785";
  if (item.includes("Sorghum")) return "orange";
  return "pink";
}

function NoRegionView({ isQuerying }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Fade
          in={isQuerying}
          unmountOnExit
        >
        <div className={classes.centeredBox}>
          <div className={classes.info}>
            <CircularProgress />
          </div>
          <div className={classes.info}>
            <Typography>Loading Data ...</Typography>
          </div>
        </div>
      </Fade>
      <Fade
          in={!isQuerying}
          unmountOnExit
        >
          <div className={classes.centeredBox} style={{padding: 80}}>
            <Typography>Select a region on the map to the left to load up the data and start running some simulations</Typography>
          </div>
        </Fade>
    </div>
  );
}

function ControlList({data, visible}) {
  // data is feature:(array of {label:name value:v} objects) object
  // visible is feature array
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.settingsList}>
        <div className={classes.info}>
          <Typography gutterBottom={true} variant="h5">Data Simulation</Typography>
          <Typography variant="body2">Adjust the data for the following year to simulate different scenarios and see the impact it has on the famine likelihood.</Typography>
        </div>
        {Object.keys(data).filter(k => visible.includes(k)).map((k,i) => (
          <Dataset
            data={data[k]}
            backgroundColor={chooseColor(k)}
            name={k} />
        ))}
      </div>
    </div>
  );
}

function ControlView({region, isQuerying, setIsQuerying, setChangedValues, regionFactors, setRegionFactors }) {
  const classes = useStyles();

  const [data, setData] = useState({});

  useEffect(() => {
    fetch("http://freddieposer.com:5000/data/all", {
      crossDomain: true,
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then((result) => {
        let datasets = {}
        let rf = {}
        Object.keys(result["regions"]).filter(region => result["regions"][region].fitted).map(region => {
          // region specific
          let df = result["regions"][region]
          rf[region] = df.historical_data._feature_names
          // filter the feature names that haven't been included?
          df.historical_data._feature_names.filter(name => !(name in datasets)).map(name => {
            datasets[name] = []
            let date_column = df.historical_data[name].columns.findIndex(x => x === "Date");
            let year_column = df.historical_data[name].columns.findIndex(x => x === "Year");
            let month_column = df.historical_data[name].columns.findIndex(x => x === "Month");
            // go to the feature "name"
            // we don't know if it's temperature, fatalities, or item type, so we try each
            var value_column_name = "Temperature"
            var value_column = df.historical_data[name].columns.findIndex(x => x === value_column_name);
            if (value_column === -1) {
              value_column_name = "Fatalities"
              value_column = df.historical_data[name].columns.findIndex(x => x === value_column_name);
            }
            if (value_column === -1) {
              value_column_name = "Price"
              value_column = df.historical_data[name].columns.findIndex(x => x === value_column_name);
            }
            let lastData = df.historical_data[name].rows.map(row => row[date_column]).reduce((a,b) => Math.max(a,b));
            
            let recent = df.historical_data[name].rows.sort((a, b) => a[date_column] - b[date_column]).slice(-6);
            let next = df.predicted_data[name].rows.filter(row => row[date_column] > lastData).sort((a, b) => a[date_column] - b[date_column]).slice(0,6);
            recent.map(row => {
              datasets[name].push({
                label: ConvertYearMonthToGraphLabel(row[year_column].toString(), row[month_column].toString()),
                value: row[value_column],
              });
            });
            next.map(row => {
              datasets[name].push({
                label: ConvertYearMonthToGraphLabel(row[year_column].toString(), row[month_column].toString()),
                value: row[value_column],
                cb: setChangedValues(name, row[year_column], row[month_column], value_column_name),
              }); 
            });
          })
        })

        setRegionFactors(rf);
        setData(datasets);
      })
      .catch(console.log);
  }, []);

  // if no region set, tell user what to do
  if (region === "") {
    return (
    <NoRegionView isQuerying={isQuerying}/>
    )
  }
  else {
    return (
      <SplitPane split="horizontal" defaultSize="85%">
        <ControlList
          data={data}
            // if region name is in regionFactors, return region-specific feature array, else return empty array
            visible={region in regionFactors ? regionFactors[region] : []} />
        <div className={classes.root}>
          <RecalculateView isQuerying={isQuerying} setIsQuerying={setIsQuerying} region={region}/>
        </div>
      </SplitPane>
    );
  }
}


export default ControlView;
