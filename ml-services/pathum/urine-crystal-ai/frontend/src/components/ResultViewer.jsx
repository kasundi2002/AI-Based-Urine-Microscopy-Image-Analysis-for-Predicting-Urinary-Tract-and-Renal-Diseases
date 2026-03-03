
import React, { useEffect, useRef, useState } from 'react';

const ResultViewer = ({ imageFile, results, onReset }) => {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(new Image());

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      imgRef.current.src = url;
      imgRef.current.onload = () => {
        setImageLoaded(true);
        drawResults();
      };
    }
  }, [imageFile, results]);

  const drawResults = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;

    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Draw bounding boxes
    if (results && results.crystals) {
      results.crystals.forEach(crystal => {
        const [x1, y1, x2, y2] = crystal.bbox;
        const width = x2 - x1;
        const height = y2 - y1;

        // Draw Box
        ctx.strokeStyle = '#00FF00'; // Green
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, width, height);

        // Draw Label Background
        ctx.fillStyle = '#00FF00';
        const text = `${crystal.classification} (${(crystal.classification_confidence * 100).toFixed(1)}%)`;
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);

        // Draw Label Text
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(text, x1 + 5, y1 - 5);
      });
    }
  };

  return (
    <div className="results-container">
      <div className="canvas-wrapper" style={{ overflow: 'auto', marginBottom: '20px' }}>
         <h3>Analysis Visualized</h3>
         <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
      </div>

      <div className="results-table">
        <h3>Detected Crystals</h3>
        {results?.crystals?.length > 0 ? (
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Confidence</th>
                <th>Detection Conf.</th>
              </tr>
            </thead>
            <tbody>
              {results.crystals.map((crystal, idx) => (
                <tr key={idx}>
                  <td>{crystal.classification}</td>
                  <td>{(crystal.classification_confidence * 100).toFixed(2)}%</td>
                  <td>{(crystal.detection_confidence * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No crystals detected.</p>
        )}
      </div>

      <button onClick={onReset} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Analyze Another Image
      </button>
    </div>
  );
};

export default ResultViewer;
