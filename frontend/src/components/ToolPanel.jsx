import React from 'react';
import {
  Paper,
  Button,
  Slider,
  FormControlLabel,
  Switch,
  Typography,
  styled
} from '@mui/material';
import {
  Undo,
  Redo,
  Clear,
  Save,
  GridOn
} from '@mui/icons-material';

const useStyles = styled((theme) => ({
  root: {
    position: 'absolute',
    left: 20,
    top: 80,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    minWidth: 200,
  },
  button: {
    justifyContent: 'flex-start',
  },
  sliderContainer: {
    marginTop: theme.spacing(2),
  }
}));

const ToolPanel = ({
  onUndo,
  onRedo,
  onClear,
  onExport,
  showGrid,
  setShowGrid,
  gridOpacity,
  setGridOpacity
}) => {
  const classes = useStyles();

  const handleGridOpacityChange = (event, newValue) => {
    setGridOpacity(newValue);
  };

  return (
    <Paper className={classes.root} elevation={3}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Undo />}
        onClick={onUndo}
        className={classes.button}
      >
        Undo
      </Button>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Redo />}
        onClick={onRedo}
        className={classes.button}
      >
        Redo
      </Button>

      <Button
        variant="contained"
        color="secondary"
        startIcon={<Clear />}
        onClick={onClear}
        className={classes.button}
      >
        Clear Selection
      </Button>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Save />}
        onClick={onExport}
        className={classes.button}
      >
        Export JSON
      </Button>

      <FormControlLabel
        control={
          <Switch
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            color="primary"
          />
        }
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <GridOn style={{ marginRight: 8 }} />
            Show Grid
          </div>
        }
      />

      {showGrid && (
        <div className={classes.sliderContainer}>
          <Typography gutterBottom>
            Grid Opacity
          </Typography>
          <Slider
            value={gridOpacity}
            onChange={handleGridOpacityChange}
            aria-labelledby="grid-opacity-slider"
            step={0.1}
            marks
            min={0.1}
            max={1}
          />
        </div>
      )}
    </Paper>
  );
};

export default ToolPanel;
