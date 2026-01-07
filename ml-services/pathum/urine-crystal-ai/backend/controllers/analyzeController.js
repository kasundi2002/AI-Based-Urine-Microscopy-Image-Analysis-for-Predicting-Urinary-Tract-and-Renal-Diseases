const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.analyzeImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = path.resolve(req.file.path);
    // Path to your python script
    // Ensure this path is correct relative to where you start the server
    const scriptPath = path.resolve(__dirname, '../python/pipeline.py');
    
    console.log(`Analyzing image: ${imagePath}`);
    console.log(`Using script: ${scriptPath}`);

    // Spawn Python process
    // Assuming 'python' is in your PATH and refers to the correct environment (with tensorflow/yolo installed)
    // You might need to change 'python' to 'python3' or the full path to the executable if using venv
    const pythonProcess = spawn('python', [scriptPath, imagePath]);

    let dataString = '';
    let errorString = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        // Collect stderr separately, but note that some libraries log to stderr even on success
        errorString += data.toString();
        // Don't treat purely as error instantly, verify exit code
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        
        // Clean up uploaded file if needed, or keep it. For now, we keep it.

        if (code !== 0) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'Analysis failed', 
                details: errorString 
            });
        }

        try {
            // Find JSON in output (resilient to logs)
            const jsonStart = dataString.indexOf('{');
            const jsonEnd = dataString.lastIndexOf('}');
            
            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error("No JSON found in output");
            }

            const jsonString = dataString.substring(jsonStart, jsonEnd + 1);
            const jsonResult = JSON.parse(jsonString);
            
            // Check if pipeline reported an error inside JSON
            if (jsonResult.status === 'error') {
                return res.status(500).json(jsonResult);
            }

            res.json(jsonResult);
        } catch (e) {
            console.error("Failed to parse Python output:", dataString);
            res.status(500).json({ 
                status: 'error', 
                message: 'Invalid response from AI pipeline', 
                raw_output: dataString 
            });
        }
    });
};
