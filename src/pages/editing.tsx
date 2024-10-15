import Navbar from "@/components/Navbar";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useEffect, useRef, useState} from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";

export default function EditingPage() {
  const [target, setTarget] = useState<HTMLElement | null>(null); // Current moveable target
  const [showBorders, setShowBorders] = useState(false); // Control border visibility
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null); // Reference for the movable image
  const [position, setPosition] = useState<{x: number; y: number}>({
    x: 0,
    y: 0,
  }); // Track the position of the image

  // Deselect when clicking outside the target
  const handleDeselect = (e: React.MouseEvent) => {
    if (imgRef.current && !imgRef.current.contains(e.target as Node)) {
      setShowBorders(false); // Hide borders
      setTarget(null); // Deselect the target
    }
  };

  useEffect(() => {
    const savedPosition = localStorage.getItem("moveablePosition");
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  useEffect(() => {
    // Whenever target is set, make sure the borders are visible if there is a valid target
    if (target) {
      setShowBorders(true);
    }
  }, [target]);

  // Function to save position to localStorage
  const savePositionToLocalStorage = (newPosition: {x: number; y: number}) => {
    localStorage.setItem("moveablePosition", JSON.stringify(newPosition));
  };

  return (
    <div className="h-screen w-full bg-white text-black dark:bg-black dark:text-white">
      <div className="w-full h-[70px] font-poppins font-semibold text-lg border-b flex items-center justify-between px-6">
        <div>Pixora</div>
        <div className="flex items-center gap-3">
          <img
            src={"/user.png"}
            alt="user"
            className="h-8 w-8 border rounded-full border-gray-700 cursor-pointer"
          />
          <Button variant="outline">Post the edit</Button>
        </div>
      </div>
      <div
        className="p-5 flex gap-3"
        style={{
          height: "calc(100vh - 70px)",
        }}
      >
        <div className="h-full w-full flex-1 bg-white rounded-xl flex justify-center items-center">
          <div
            className="h-full w-full flex-1 bg-white rounded-xl flex justify-center items-center"
            onClick={handleDeselect} // Deselect on outside click
          >
            <div
              ref={containerRef}
              className="h-full w-full bg-gray-100 overflow-hidden rounded-lg relative"
            >
              {/* Background image */}
              <img
                src="/background.png" // Use the correct path to the public folder image
                alt="background"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />

              {/* Moveable image on top of background */}
              <img
                src="/boy.png" // Path to the new image
                alt="movable"
                className="absolute moveable-item"
                ref={imgRef} // Ref for Selecto and Moveable
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`, // Apply the initial position from state
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent deselection when clicking on the image
                  setTarget(imgRef.current); // Set the image as the target
                  setShowBorders(true); // Show borders on click
                }}
              />

              {/* Moveable component */}
              {target && showBorders && (
                <Moveable
                  target={target}
                  draggable={true}
                  throttleDrag={0}
                  renderDirections={[
                    "n",
                    "s",
                    "e",
                    "w",
                    "nw",
                    "ne",
                    "sw",
                    "se",
                  ]} // Show all resize directions
                  onDrag={({target, beforeTranslate}) => {
                    const newX = beforeTranslate[0];
                    const newY = beforeTranslate[1];
                    setPosition({x: newX, y: newY}); // Update position in state during drag
                    (
                      target as HTMLElement
                    ).style.transform = `translate(${newX}px, ${newY}px)`;
                  }}
                  onDragEnd={() => {
                    savePositionToLocalStorage(position); // Save position to localStorage after dragging ends
                    setShowBorders(true); // Keep borders after dragging
                  }}
                />
              )}

              {/* Selecto component */}
              <Selecto
                container={containerRef.current}
                selectableTargets={[".moveable-item"]}
                hitRate={0}
                selectByClick={true}
                selectFromInside={false} // Prevent selection from starting inside
                onSelect={({selected}) => {
                  if (selected.length > 0) {
                    setTarget(selected[0] as HTMLElement); // Set the first selected item as moveable target
                    setShowBorders(true); // Show borders on selection
                  } else {
                    setShowBorders(false); // Hide borders if nothing is selected
                  }
                }}
                onDragStart={(e) => {
                  // Prevent Selecto from starting if the drag starts inside the image area
                  if (
                    imgRef.current &&
                    imgRef.current.contains(e.inputEvent.target as Node)
                  ) {
                    e.preventDefault(); // Stop Selecto if the drag starts from within the image
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-start h-full w-[300px] rounded-xl border flex-col p-4">
          <div className="flex flex-col gap-3 justify-start">
            <Label htmlFor="aiprompt" className="">
              Generate New Background
            </Label>
            <Textarea
              name="aiprompt"
              placeholder="Give your AI Prompt Here"
              className="w-full h-[140px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
