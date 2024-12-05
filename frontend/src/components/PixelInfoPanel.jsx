import React from 'react';
import {
  Paper,
  Typography,
  Divider,
  styled
} from '@mui/material';

const useStyles = styled((theme) => ({
  root: {
    position: 'absolute',
    right: 20,
    top: 80,
    padding: theme.spacing(2),
    minWidth: 250,
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  label: {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  },
  value: {
    fontFamily: 'monospace',
  }
}));

const PixelInfoPanel = ({ selectedPixels, imageMetadata }) => {
  const classes = useStyles();

  const calculateAverageColor = () => {
    if (!selectedPixels.length) return null;

    let totalR = 0, totalG = 0, totalB = 0;
    selectedPixels.forEach(pixel => {
      if (pixel.color) {
        totalR += pixel.color.rgb[0];
        totalG += pixel.color.rgb[1];
        totalB += pixel.color.rgb[2];
      }
    });

    const count = selectedPixels.length;
    return {
      r: Math.round(totalR / count),
      g: Math.round(totalG / count),
      b: Math.round(totalB / count)
    };
  };

  const averageColor = calculateAverageColor();

  return (
    <Paper className={classes.root} elevation={3}>
      <div className={classes.section}>
        <Typography variant="h6" gutterBottom>
          Image Information
        </Typography>
        <Typography variant="body2">
          <span className={classes.label}>Filename:</span>
          <span className={classes.value}>{imageMetadata?.filename}</span>
        </Typography>
        <Typography variant="body2">
          <span className={classes.label}>Resolution:</span>
          <span className={classes.value}>{imageMetadata?.resolution}</span>
        </Typography>
        <Typography variant="body2">
          <span className={classes.label}>Aspect Ratio:</span>
          <span className={classes.value}>{imageMetadata?.aspect_ratio}</span>
        </Typography>
      </div>

      <Divider className={classes.divider} />

      <div className={classes.section}>
        <Typography variant="h6" gutterBottom>
          Selection Information
        </Typography>
        <Typography variant="body2">
          <span className={classes.label}>Selected Pixels:</span>
          <span className={classes.value}>{selectedPixels.length}</span>
        </Typography>
        
        {averageColor && (
          <>
            <Typography variant="body2">
              <span className={classes.label}>Average Color:</span>
            </Typography>
            <div style={{
              width: '100%',
              height: 30,
              backgroundColor: `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`,
              marginTop: 8,
              borderRadius: 4,
              border: '1px solid #ccc'
            }} />
            <Typography variant="body2" className={classes.value}>
              RGB({averageColor.r}, {averageColor.g}, {averageColor.b})
            </Typography>
          </>
        )}
      </div>
    </Paper>
  );
};

export default PixelInfoPanel;
