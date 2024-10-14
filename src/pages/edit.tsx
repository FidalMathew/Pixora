import React, { useRef, useEffect, useState } from "react";
import "./canva.css";

const Edit = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<null | string>(null);

  // State for filters (person's image)
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [invert, setInvert] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [scale, setScale] = useState(1);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  // State for background filters
  const [bgBrightness, setBgBrightness] = useState(100);
  const [bgContrast, setBgContrast] = useState(100);
  const [bgSaturation, setBgSaturation] = useState(100);
  const [bgHue, setBgHue] = useState(0);
  const [bgBlur, setBgBlur] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(100);
  const [bgGrayscale, setBgGrayscale] = useState(0);
  const [bgInvert, setBgInvert] = useState(0);
  const [bgSepia, setBgSepia] = useState(0);

  // New state for background image URL
  const [backgroundImageUrl, setBackgroundImageUrl] =
    useState("background.png");

  const handleMouseDown = (e: { clientX: number; clientY: number; }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if mouse is over the person's image
    if (
      mouseX >= position.x &&
      mouseX <= position.x + 400 * scale &&
      mouseY >= position.y &&
      mouseY <= position.y + 500 * scale
    ) {
      setSelectedImage("person");
    } else if (
      mouseX >= 0 &&
      mouseX <= canvas.width &&
      mouseY >= 0 &&
      mouseY <= canvas.height
    ) {
      setSelectedImage("background");
    } else {
      setSelectedImage(null);
    }

    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
    if (isDragging && selectedImage === "person") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
      const newX = e.clientX - rect.left - (400 * scale) / 2;
      const newY = e.clientY - rect.top - (500 * scale) / 2;
      setPosition({ x: newX, y: newY });
    }
  };

  // Function to download the canvas image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "merged_image.png"; // Set the name for the downloaded file
    if (canvas) {
      link.href = canvas.toDataURL("image/png"); // Convert canvas to data URL
    }
    link.click(); // Trigger the download
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const backgroundImage = new Image();
    const personImage = new Image();

    backgroundImage.src = backgroundImageUrl;
    personImage.src = "person.png";

    const drawImages = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set filters for the background
      ctx.filter = `
        brightness(${bgBrightness}%) 
        contrast(${bgContrast}%) 
        saturate(${bgSaturation}%) 
        hue-rotate(${bgHue}deg) 
        blur(${bgBlur}px) 
        opacity(${bgOpacity}%) 
        grayscale(${bgGrayscale}%) 
        invert(${bgInvert}%) 
        sepia(${bgSepia}%)`;
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      // Set filters for the person's image
      ctx.filter = `
        brightness(${brightness}%) 
        contrast(${contrast}%) 
        saturate(${saturation}%) 
        hue-rotate(${hue}deg) 
        blur(${blur}px) 
        opacity(${opacity}%) 
        grayscale(${grayscale}%) 
        invert(${invert}%) 
        sepia(${sepia}%)`;

      ctx.save();
      if (flipHorizontal) {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }
      if (flipVertical) {
        ctx.scale(1, -1);
        ctx.translate(0, -canvas.height);
      }

      ctx.drawImage(
        personImage,
        position.x,
        position.y,
        400 * scale,
        500 * scale
      );

      if (selectedImage === "person") {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(position.x, position.y, 400 * scale, 500 * scale);
        ctx.setLineDash([]);
      }
      ctx.restore();
    };

    backgroundImage.onload = drawImages;
    personImage.onload = drawImages;

    drawImages();
  }, [
    position,
    selectedImage,
    brightness,
    contrast,
    saturation,
    hue,
    blur,
    opacity,
    grayscale,
    invert,
    sepia,
    scale,
    flipHorizontal,
    flipVertical,
    bgBrightness,
    bgContrast,
    bgSaturation,
    bgHue,
    bgBlur,
    bgOpacity,
    bgGrayscale,
    bgInvert,
    bgSepia,
    backgroundImageUrl,
  ]);

  return (
    <div style={{ display: "flex" }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ border: "1px solid black" }}
      />
      <div style={{ marginLeft: "20px" }}>
        <h3>Adjust Properties</h3>
        <label>
          Background Image URL:
          <input
            type="text"
            value={backgroundImageUrl}
            onChange={(e) => setBackgroundImageUrl(e.target.value)}
          />
        </label>
        <br />
        {selectedImage === "person" ? (
          <>
            <h4>Person's Image Properties</h4>
            <label>
              Brightness:
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Contrast:
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Saturation:
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Hue Rotation:
              <input
                type="range"
                min="-180"
                max="180"
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Blur:
              <input
                type="range"
                min="0"
                max="20"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Opacity:
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Grayscale:
              <input
                type="range"
                min="0"
                max="100"
                value={grayscale}
                onChange={(e) => setGrayscale(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Invert:
              <input
                type="range"
                min="0"
                max="100"
                value={invert}
                onChange={(e) => setInvert(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Sepia:
              <input
                type="range"
                min="0"
                max="100"
                value={sepia}
                onChange={(e) => setSepia(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Scale:
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Flip Horizontal:
              <input
                type="checkbox"
                checked={flipHorizontal}
                onChange={(e) => setFlipHorizontal(e.target.checked)}
              />
            </label>
            <br />
            <label>
              Flip Vertical:
              <input
                type="checkbox"
                checked={flipVertical}
                onChange={(e) => setFlipVertical(e.target.checked)}
              />
            </label>
          </>
        ) : (
          <>
            <h4>Background Image Properties</h4>
            <label>
              Brightness:
              <input
                type="range"
                min="0"
                max="200"
                value={bgBrightness}
                onChange={(e) => setBgBrightness(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Contrast:
              <input
                type="range"
                min="0"
                max="200"
                value={bgContrast}
                onChange={(e) => setBgContrast(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Saturation:
              <input
                type="range"
                min="0"
                max="200"
                value={bgSaturation}
                onChange={(e) => setBgSaturation(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Hue Rotation:
              <input
                type="range"
                min="-180"
                max="180"
                value={bgHue}
                onChange={(e) => setBgHue(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Blur:
              <input
                type="range"
                min="0"
                max="20"
                value={bgBlur}
                onChange={(e) => setBgBlur(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Opacity:
              <input
                type="range"
                min="0"
                max="100"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Grayscale:
              <input
                type="range"
                min="0"
                max="100"
                value={bgGrayscale}
                onChange={(e) => setBgGrayscale(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Invert:
              <input
                type="range"
                min="0"
                max="100"
                value={bgInvert}
                onChange={(e) => setBgInvert(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Sepia:
              <input
                type="range"
                min="0"
                max="100"
                value={bgSepia}
                onChange={(e) => setBgSepia(Number(e.target.value))}
              />
            </label>
          </>
        )}
        <button onClick={downloadImage}>Download Merged Image</button>
      </div>
    </div>
  );
};

export default Edit;
