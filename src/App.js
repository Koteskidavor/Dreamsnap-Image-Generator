import {useState, useEffect, useRef} from 'react';
import { TextField, Box, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './App.css';
function App() {
    const [image, setImage] = useState('');
    const [imageQuery, setImageQuery] = useState('');
    const [progress, setProgress] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const query = async (data) => {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
            {
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.blob();
        return result;
    }
    const generateImage = async () => {
        if(!imageQuery) return;
        setImage('');
        setIsGenerating(true);

        const xhr = new XMLHttpRequest();

        xhr.onload = function() {
            if (xhr.status === 200) {
                const imageBlob = xhr.response;
                const url = URL.createObjectURL(imageBlob);
                setImage(url);
            } else {
                console.log("Image generation failed", xhr.statusText);
            }
            setIsGenerating(false);
        };
        xhr.onerror = function() {
            console.log("Request failed");
            setIsGenerating(false);
        };

        const imageBlob = await query({ "inputs": imageQuery });
        const url = URL.createObjectURL(imageBlob);

        setImage(url);
        setIsGenerating(false);
    }
    const handleKeyDown = (e) => {
        if(e.key === 'Enter') {
            generateImage();
        }
    }
    const canvasRef = useRef();
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const numStars = 200;
        const stars = [];

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const generateStars = () => {
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2,
                    alpha: Math.random(),
                });
            }
        };

        const drawStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach((star) => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            });
        };

        const animateStars = () => {
            stars.forEach((star) => {
                star.alpha += (Math.random() - 0.5) * 0.05;
                if (star.alpha < 0) star.alpha = 0;
                if (star.alpha > 1) star.alpha = 1;
            });
            drawStars();
            requestAnimationFrame(animateStars);
        };

        generateStars();
        animateStars();

        return () => {
            window.cancelAnimationFrame(animateStars);
        };

    }, [])
    return (
        <div>
            <canvas  ref={canvasRef}
                     style={{
                         position: 'fixed',
                         top: 0,
                         left: 0,
                         width: '100vw',
                         height: '100vh',
                         zIndex: '-1',
                         backgroundColor: 'black',
                     }}
            />
            <Box className={`roll-container ${image ? 'roll-down' : ''}`} >
                <img src={image} alt="Generated" style={{ width: '600px', height: '600px' }} />
            </Box>
           <Box className={`loading ${isGenerating ? 'active' : ''}`} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center',}} ></Box>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
                <TextField
                    value={imageQuery}
                    onChange={(e) => setImageQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Button onClick={generateImage} >
                                    <SearchIcon />
                                </Button>
                            </InputAdornment>
                        )
                    }}
                    sx={{ background: 'white', color: 'black', borderRadius: '4px' }}
                />
           </Box>
        </div>
    );
}

export default App;
