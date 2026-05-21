import { useState, useEffect, useRef } from "react";
import { TextField, Box, Button, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./App.css";
function App() {
  const [image, setImage] = useState("");
  const [imageQuery, setImageQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const query = async (data) => {
    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",

        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }
      const result = await response.blob();
      return result;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };
  const generateImage = async () => {
    if (!imageQuery) return;
    setImage("");
    setIsGenerating(true);

    try {
      const imageBlob = await query({
        inputs: imageQuery,
        parameters: {
          num_inference_steps: 4,
          height: 1024,
          width: 1024,
        },
      });
      const url = URL.createObjectURL(imageBlob);
      setImage(url);
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      generateImage();
    }
  };
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
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
  }, []);
  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: "-1",
          backgroundColor: "black",
        }}
      />
      <Box className={`roll-container ${image ? "roll-down" : ""}`}>
        <img
          src={image}
          alt="Generated"
          style={{ width: "600px", height: "600px" }}
        />
      </Box>
      <Box
        className={`loading ${isGenerating ? "active" : ""}`}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      ></Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "10px",
          width: "auto",
        }}
      >
        <TextField
          value={imageQuery}
          onChange={(e) => setImageQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={generateImage}>
                  <SearchIcon />
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            background: "white",
            color: "black",
            borderRadius: "4px",
          }}
        />
      </Box>
    </div>
  );
}

export default App;
