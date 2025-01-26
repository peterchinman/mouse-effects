import type { Component } from "solid-js";
import { createEffect, createSignal, For, Show, Switch, Match } from "solid-js";


function ShapeSelect({buttonText, shape, whichShapeSelected, setWhichShapeSelected}){
  return (
    <button
      class={
        `${whichShapeSelected() === shape ? 'active' : ''}
        px-2
        `}
      onClick={() => setWhichShapeSelected(shape)}
    >
      {buttonText}
    </button>
  );
}

function MouseMove() {
  type PossibleShapeTypes = "rect" | "ellipse";

  interface Coordinates {
    x: number;
    y: number;
  }

  interface Shape {
    shapeType: PossibleShapeTypes;
  }
  interface NewShape extends Shape {
    start: Coordinates;
    end: Coordinates;
  }
  interface Rect extends Shape {
    x: number;
    y: number;
    width: number;
    height : number;
  }
  interface Ellipse extends Shape {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
  }
  type ShapeAttribute = Rect | Ellipse;

  const [whichShapeSelected, setWhichShapeSelected] = createSignal<PossibleShapeTypes>("rect");
  const [newShape, setNewShape] = createSignal<NewShape>(null);
  const [shapes, setShapes] = createSignal<ShapeAttribute[]>([]);
  const [pos, setPos] = createSignal<Coordinates>({ x: 0, y: 0 });
  
  const headerHeight = 48;

  function handleMouseDown(event){
    setNewShape({
      shapeType: whichShapeSelected(),
      start: {x: event.clientX, y: event.clientY - headerHeight},
      end: {x: event.clientX, y: event.clientY - headerHeight},
    });
  }

  function handleMouseMove(event){
    setPos({
      x: event.clientX,
      y: event.clientY - headerHeight
    })

    if (newShape()){
      const endX = event.clientX;
      const endY = event.clientY - headerHeight;

      setNewShape({
        ...newShape(),
        end: {x: endX, y: endY},
      });
    }
  }

  // TODO: `shapes()` should contain the actual data needed to render the shape
  // so that we don't have to call `getAttributesFromCoordinates()` on it

  function handleMouseUp() {
    if (newShape()) {
      // convert new Shape coordinates to a render shape object
      const shapeAttribute = getAttributesFromCoordinates(newShape());

      setShapes([...shapes(), shapeAttribute]);
      setNewShape(null);
    }
  }

  function getAttributesFromCoordinates(newShape: NewShape): ShapeAttribute{
    const{shapeType, start, end} = newShape;

    if(shapeType === "rect"){
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(start.x - end.x);
      const height = Math.abs(start.y - end.y);
  
      return { shapeType, x, y, width, height };
    }
    else if(shapeType === "ellipse"){
      const cx = Math.min(start.x, end.x) + Math.abs(start.x - end.x) * .5;
      const cy = Math.min(start.y, end.y) + Math.abs(start.y - end.y) * .5;
      const rx = Math.abs(start.x - end.x) / 2;
      const ry = Math.abs(start.y - end.y) / 2;
  
      return {shapeType, cx, cy, rx, ry};
    }
  }

  return (
    <>
    <header class="flex gap-8 items-center px-8 bg-gray-200 z-2 min-h-[48px]">
      {/* Display current mouse position */}
      <div class="min-w-[10vw]">{pos().x} x {pos().y}</div>
      <ShapeSelect
        buttonText="Rectangle"
        shape="rect"
        whichShapeSelected={whichShapeSelected}
        setWhichShapeSelected={setWhichShapeSelected}
      ></ShapeSelect>
      <ShapeSelect
        buttonText="Ellipse"
        shape="ellipse"
        whichShapeSelected={whichShapeSelected}
        setWhichShapeSelected={setWhichShapeSelected}
      ></ShapeSelect>
    </header>
    <div
      class="w-full h-[calc(100vh-48px)] relative cursor-crosshair bg-gray-100"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      

      {/* SVG Container */}
      <svg
        class="absolute inset-0 w-full h-full"
      >
        {/* Render completed shapes */}
        <For each={shapes()}>{(shape) =>
          <Switch>
            <Match when={shape.shapeType === "rect"}>
              <rect
                {...shape}
                  fill="none"
                  stroke="red"
                  stroke-width="2"
              />
            </Match>
            <Match when={shape.shapeType === "ellipse"}>
              <ellipse
                {...shape}
                  fill="none"
                  stroke="red"
                  stroke-width="2"
              />
            </Match>
          </Switch>
          
        }</For>

        {/* Render the rectangle being drawn */}
        <Show when={newShape()}>
          <Switch>
            <Match when={newShape().shapeType === "rect"}>
              <rect
                {...getAttributesFromCoordinates(newShape())}
                  fill="none"
                  stroke="blue"
                  stroke-width="2"
              />
            </Match>
            <Match when={newShape().shapeType === "ellipse"}>
              <ellipse
                {...getAttributesFromCoordinates(newShape())}
                  fill="none"
                  stroke="blue"
                  stroke-width="2"
              />
            </Match>
          </Switch>
        </Show>
      </svg>
      
    </div>
    </>
    
  );
}

const App: Component = () => {
  return <MouseMove />;
};

export default App;
