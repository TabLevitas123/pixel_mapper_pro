import React from 'react';
import {
  Paper,
  Button,
  Slider,
  FormControlLabel,
  Switch,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  styled,
  useTheme
} from '@mui/material';
import {
  Undo,
  Redo,
  Clear,
  Save,
  GridOn,
  CropFree,
  TouchApp,
  ZoomIn,
  ZoomOut,
  Map
} from '@mui/icons-material';

const useStyles = styled((theme) => ({
  root: {
    position: 'absolute',
    left: 20,
    top: 80,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    minWidth: 280,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: theme.shape.borderRadius,
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
    opacity: 0.9,
    '&:hover': {
      transform: 'scale(1.02)',
      opacity: 1,
    },
  },
  button: {
    justifyContent: 'flex-start',
    transition: 'background-color 0.3s, transform 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'scale(1.05)',
    },
  },
  sliderContainer: {
    marginTop: theme.spacing(2),
    transition: 'opacity 0.3s ease-in-out',
  },
  toggleGroup: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    transition: 'opacity 0.3s ease-in-out',
  },
  divider: {
    margin: theme.spacing(2, 0),
    borderTop: `1px solid ${theme.palette.divider}`,
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
  setGridOpacity,
  selectionMode,
  setSelectionMode,
  showMiniMap,
  setShowMiniMap,
  zoomLevel,
  setZoomLevel
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const handleGridOpacityChange = (event, newValue) => {
    setGridOpacity(newValue);
  };

  const handleSelectionModeChange = (event, newMode) => {
    if (newMode !== null) {
      setSelectionMode(newMode);
    }
  };

  const handleZoomChange = (event, newValue) => {
    setZoomLevel(newValue);
  };

  return (
    <Paper className={classes.root} elevation={3}>
      <Typography variant="h6" gutterBottom>
        Selection Tools
      </Typography>
      
      <ToggleButtonGroup
        value={selectionMode}
        exclusive
        onChange={handleSelectionModeChange}
        className={classes.toggleGroup}
      >
        <ToggleButton value="box" aria-label="box selection">
          <CropFree /> Box Select
        </ToggleButton>
        <ToggleButton value="pixel" aria-label="pixel selection">
          <TouchApp /> Pixel Select
        </ToggleButton>
      </ToggleButtonGroup>

      <div className={classes.divider} />
      
      <Typography variant="h6" gutterBottom>
        Zoom Controls
      </Typography>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
        <ZoomOut />
        <Slider
          value={zoomLevel}
          onChange={handleZoomChange}
          aria-labelledby="zoom-slider"
          step={0.1}
          min={0.1}
          max={5}
        />
        <ZoomIn />
      </div>

      <div className={classes.divider} />

      <Typography variant="h6" gutterBottom>
        History
      </Typography>

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

      <div className={classes.divider} />

      <Typography variant="h6" gutterBottom>
        View Options
      </Typography>

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

      <FormControlLabel
        control={
          <Switch
            checked={showMiniMap}
            onChange={(e) => setShowMiniMap(e.target.checked)}
            color="primary"
          />
        }
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Map style={{ marginRight: 8 }} />
            Show Mini-map
          </div>
        }
      />

      <div className={classes.divider} />

      <Button
        variant="contained"
        color="primary"
        startIcon={<Save />}
        onClick={onExport}
        className={classes.button}
      >
        Export JSON
      </Button>
    </Paper>
  );
};

export default ToolPanel;
