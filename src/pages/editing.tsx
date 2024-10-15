import Navbar from "@/components/Navbar";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useEffect, useRef, useState} from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import {Formik, Field, Form} from "formik";

export default function EditingPage() {
  const [target, setTarget] = useState<HTMLElement | null>(null); // Current moveable target
  const [showBorders, setShowBorders] = useState(false); // Control border visibility
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null); // Reference for the movable image
  const [position, setPosition] = useState<{x: number; y: number}>({
    x: 0,
    y: 0,
  }); // Track the position of the image
  const [size, setSize] = useState<{width: number; height: number}>({
    width: 100,
    height: 100,
  });

  // Deselect when clicking outside the target
  const handleDeselect = (e: React.MouseEvent) => {
    if (imgRef.current && !imgRef.current.contains(e.target as Node)) {
      setShowBorders(false); // Hide borders
      setTarget(null); // Deselect the target
    }
  };

  useEffect(() => {
    // Whenever target is set, make sure the borders are visible if there is a valid target
    if (target) {
      setShowBorders(true);
    }
  }, [target]);
  useEffect(() => {
    const savedPosition = localStorage.getItem("moveablePosition");
    const savedSize = localStorage.getItem("moveableSize");
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition)); // Parse and set the saved position
    }
    if (savedSize) {
      setSize(JSON.parse(savedSize)); // Parse and set the saved size
    }
  }, []);

  // Function to save position and size to localStorage
  const saveToLocalStorage = (
    newPosition: {x: number; y: number},
    newSize: {width: number; height: number}
  ) => {
    localStorage.setItem("moveablePosition", JSON.stringify(newPosition));
    localStorage.setItem("moveableSize", JSON.stringify(newSize));
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
                  width: `${size.width}px`, // Apply the saved width
                  height: `${size.height}px`, // Apply the saved height
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
                  resizable={true}
                  throttleDrag={0}
                  throttleResize={0}
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
                  onResize={({target, width, height, drag}) => {
                    // Apply the updated size to the target element
                    const newX = drag.beforeTranslate[0];
                    const newY = drag.beforeTranslate[1];
                    setPosition({x: newX, y: newY}); // Update position due to resize drag
                    setSize({width, height}); // Update size in state
                    (target as HTMLElement).style.width = `${width}px`;
                    (target as HTMLElement).style.height = `${height}px`;
                    (
                      target as HTMLElement
                    ).style.transform = `translate(${newX}px, ${newY}px)`;
                  }}
                  onDragEnd={() => {
                    saveToLocalStorage(position, size); // Save position and size to localStorage after dragging ends
                    setShowBorders(true); // Keep borders after dragging
                  }}
                  onResizeEnd={() => {
                    saveToLocalStorage(position, size); // Save position and size to localStorage after resizing ends
                    setShowBorders(true); // Keep borders after resizing
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
        <div className="flex h-full w-[300px] rounded-xl border flex-col p-4 justify-between">
          <Formik initialValues={{aiprompt: ""}} onSubmit={() => {}}>
            {(formik) => (
              <Form>
                <div className="flex flex-col gap-3 justify-start">
                  <Label htmlFor="aiprompt" className="">
                    Generate New Background
                  </Label>
                  <Textarea
                    name="aiprompt"
                    id="aiprompt"
                    placeholder="Give your AI Prompt Here"
                    className="w-full h-[140px]"
                  />
                  <Button type="submit">Generate</Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
