import App from "../Droo/App/App";
import canvasHTML from "../Droo/Canvas/CanvasHTML";
import Vector2 from "../Droo/Structures/Vector2";
import FrameComponentHTML from "../Droo/Mesh/FrameComponentHTML";
import ComponentHTML from "../Droo/Mesh/ComponentHTML";

class Designer {
  app: App;
  canvasHTML: canvasHTML;
  mouseMode: string;
  mouseSubMode: string;
  hoveredComponent: ComponentHTML;
  selectedComponent: ComponentHTML;
  ComponentFrameContainer: ComponentHTML;

  constructor() {
    // Setup app and its canvas settings
    this.app = new App();
    this.canvasHTML = this.app.createCanvasHTML("#canvas");
    this.canvasHTML.autoMousePan = true;
    this.canvasHTML.autoMouseZoom = true;
    // Add mouse events for canvas
    this.canvasHTML.mouse.addEvent("MouseWheel", this.onMouseWheel);
    this.canvasHTML.mouse.addEvent("MouseDown", this.onMouseDown);
    this.canvasHTML.mouse.addEvent("MouseMove", this.onMouseMove);
    this.canvasHTML.mouse.addEvent("MouseUp", this.onMouseUp);
    // Intialize class variables
    this.hoveredComponent = null;
    this.selectedComponent = null;
    this.ComponentFrameContainer = null;
    this.mouseMode = "SELECT";
    this.mouseSubMode = "SELECT";
    // Intialize demo
    this.setupDemo();
  }

  onMouseWheel = (ev: MouseEvent) => {
    
  }

  onMouseDown = (ev: MouseEvent) => {
    // Get the position in screen coordinates
    const position = this.canvasHTML.getScreenPosition(new Vector2(ev.clientX, ev.clientY));
    // Check if selection can be done
    let select = false;
    if(this.mouseMode == "SELECT") {
      if(this.canvasHTML.mouse.leftDown) select = true;
    }
    else if (this.mouseMode == "SELECTED" && this.mouseSubMode == "SELECT") {
      if(this.canvasHTML.mouse.leftDown) select = true;
    }
    // ---------------------------------------------------------------- //
    // If mouse modes allows selection, then perform a selection test at mouse position
    if(select) {
      this.selectComponent(position);
    }
  }

  onMouseMove = (ev: MouseEvent) => {
    // Get the position in screen coordinates
    const position = this.canvasHTML.getScreenPosition(new Vector2(ev.clientX, ev.clientY));
    // Check if resizing can be done
    let resize = false;
    if (this.mouseMode.startsWith("RESIZE")) {
      // If resize is enabled but mouse left button is not pressed, reset mode back to selected
      if(this.canvasHTML.mouse.leftDown) resize = true;
      else this.mouseMode = "SELECTED";
    }
    // Check if movement can be done
    let move = false;
    if (this.mouseMode == "MOVE") {
      // If move is enabled but mouse left button is not pressed, reset mode back to selected
      if(this.canvasHTML.mouse.leftDown) move = true;
      else this.mouseMode = "SELECTED";
    }
    // Check if mouse over selected component check can be done
    let overSelected = false;
    if (this.mouseMode == "SELECTED") overSelected = true;
    // ---------------------------------------------------------------- //
    // If mouse component is selected, then check if mouse is over it for move and resize
    if(overSelected) {
      this.mouseSubMode = this.checkForResizeAndDrag(position);
      // If left mouse button is pressed then copy mouse sub mode to mouse mode
      if(this.canvasHTML.mouse.leftDown) this.mouseMode = this.mouseSubMode;
    }
    // If mouse modes allows resize, then resize
    else if (resize) {
      this.resize(this.canvasHTML.mouse.deltaMovement);
    }
    // If mouse modes allows move, then move
    else if (move) {
      this.move(this.canvasHTML.mouse.deltaMovement);
    } 
    // Update after move event
    this.update();
  }

  onMouseUp = (ev: MouseEvent) => {
    // Get the position in screen coordinates
    const position = this.canvasHTML.getScreenPosition(new Vector2(ev.clientX, ev.clientY));
    // Check if resizing is done
    if (this.mouseMode.startsWith("RESIZE")) {
      // If left mouse button is not pressed then resize is just finished, so reset the mode back to selected
      if(!this.canvasHTML.mouse.leftDown) this.mouseMode = "SELECTED";
    }
    // Check if movement is done
    if (this.mouseMode == "MOVE") {
      // If left mouse button is not pressed then resize is just finished, so reset the mode back to selected
      if(!this.canvasHTML.mouse.leftDown) this.mouseMode = "SELECTED";
      // If component is selected then enable its outline
      if(this.selectedComponent) {
        this.selectedComponent.outlineStyle = "SOLID";
        this.selectedComponent.outline = true;
      }
      // If frame container exists because it can add selected component
      if(this.ComponentFrameContainer) {
        // Disable the outline of the frame container
        this.ComponentFrameContainer.outline = false;
        this.ComponentFrameContainer = null;
      }
    }
    // Check if mouse over selected component check can be done
    let overSelected = false;
    if (this.mouseMode == "SELECTED") overSelected = true;
    // ---------------------------------------------------------------- //
     // If mouse component is selected, then check if mouse is over it for move and resize
    if(overSelected) {
      this.mouseSubMode = this.checkForResizeAndDrag(position);
    } 
    // Update after move event
    this.update();
  }

  selectComponent = (position: Vector2) => { 
    // Unselect the previously selected component
    if(this.selectedComponent) {
      this.selectedComponent.outline = false;
      this.selectedComponent = null;
    }
    // If component is selected then draw its outline and change mouse mode accordingly
    this.selectedComponent = this.canvasHTML.pickComponentByShape(position);
    if(this.selectedComponent) {
      this.selectedComponent.outlineStyle = "SOLID";
      this.selectedComponent.outline = true;
      this.mouseMode = "SELECTED";
    } else {
      this.mouseMode = "SELECT";
    }
    // Update after component selection or unselection
    this.update();
  }

  checkForResizeAndDrag  = (position: Vector2): string => {
    if (this.selectedComponent) {
      // Check the selected component for resizing
      const resizeStatus = this.checkForResize(position);
      if(resizeStatus !== "SELECT") return resizeStatus;
      // If resizing is not possible then check selected component for movement
      else {
        const dragStatus = this.checkForMove(position);
        if(dragStatus !== "SELECT") return dragStatus;
      }
    }
    return "SELECT";
  }

  checkForResize = (position: Vector2): string => {
    // If selected componenet is resizable, check the if position is around the outline
    if(this.selectedComponent && this.selectedComponent.isResizable) {
      const overPosition = this.selectedComponent.isPositionOverOutline(position);
      if(overPosition) {
        if(overPosition == 1) return "RESIZE_LEFT";
        else if(overPosition == 2) return "RESIZE_TOP";
        else if(overPosition == 3) return "RESIZE_RIGHT";
        else if(overPosition == 4) return "RESIZE_BOTTOM";
        else if(overPosition == 21) return "RESIZE-COMBINE_TOP_LEFT";
        else if(overPosition == 23) return "RESIZE-COMBINE_TOP_RIGHT";
        else if(overPosition == 41) return "RESIZE-COMBINE_BOTTOM_LEFT";
        else if(overPosition == 43) return "RESIZE-COMBINE_BOTTOM_RIGHT";
      }
    }
    return "SELECT";
  }

  checkForMove = (position: Vector2): string => {
    // If selected component is movable, check the if position is inside the shape, over another shape or none
    if(this.selectedComponent && this.selectedComponent.isMovable) {
      const newSelectedComponent = this.canvasHTML.pickComponentByShape(position)
      if(newSelectedComponent && (newSelectedComponent.id !== this.selectedComponent.id)) return "SELECT";
      else if (!newSelectedComponent) return "SELECT";
      else return "MOVE";
    }
    return "SELECT";
  }

  setupDemo = () => {
    const x = new FrameComponentHTML(new Vector2(100,100), 250, 250, "#FFBF00");
    const y = new FrameComponentHTML(new Vector2(500,200), 50, 50, "#0FFF00");
    const z = new FrameComponentHTML(new Vector2(700,300), 70, 70, "#FF0000");
    this.canvasHTML.addComponent(x);
    this.canvasHTML.addComponent(y);
    this.canvasHTML.addComponent(z);
    this.update();
  }

  move = (deltaMovement: Vector2) => {
    // If component is selected, move it by delta movement values
    if(this.selectedComponent) {
      this.selectedComponent.outline = false;
      this.selectedComponent.move(new Vector2(deltaMovement.x, deltaMovement.y));
      // Remove the data of old frame container
      if(this.ComponentFrameContainer) {
        this.ComponentFrameContainer.outline = false;
        this.ComponentFrameContainer = null;
      }
      // If selected component can be added to a frame, then update the data for new frame container
      this.ComponentFrameContainer = this.canvasHTML.pickComponentFrameContainer(this.selectedComponent);
      // If frame container exists because it can add selected component
      if(this.ComponentFrameContainer) {
        // Draw the frame continer outline
        this.ComponentFrameContainer.outlineStyle = "SOLID";
        this.ComponentFrameContainer.outline = true;
        // If selected component has a different parent
        if(this.ComponentFrameContainer.id !== this.selectedComponent.parent.id) {
          // Add selected component to new frame container
          this.canvasHTML.addComponent(this.selectedComponent, this.ComponentFrameContainer);
        }
      }
      // If frame container does not exist then remove the selected object from any frame container and add it back to canvas
      else {
        // Add it back to canvas if its not already at root
        if(!this.selectedComponent.parent.isRoot) this.canvasHTML.addComponent(this.selectedComponent);
      }
    }
  }

  resize = (deltaMovement: Vector2) => {
    // If component is selected, resize it by delta movement values
    let mode = this.mouseMode;
    if(mode == "RESIZE_LEFT") {
      if(!this.selectedComponent.leftResize(deltaMovement.x)) mode = "RESIZE_RIGHT";
    } else if(mode == "RESIZE_RIGHT") {
      if(!this.selectedComponent.rightResize(deltaMovement.x)) mode = "RESIZE_LEFT";
    } else if(mode == "RESIZE_TOP") {
      if(!this.selectedComponent.topResize(deltaMovement.y)) mode = "RESIZE_BOTTOM";
    } else if(mode == "RESIZE_BOTTOM") {
      if(!this.selectedComponent.bottomResize(deltaMovement.y)) mode = "RESIZE_TOP";
    } else if(mode.startsWith("RESIZE-COMBINE")) {
      const combinedModes = mode.split("_");
      let vertical = combinedModes[1];
      let horizontal = combinedModes[2];
      if(vertical == "TOP") {
        if(!this.selectedComponent.topResize(deltaMovement.y)) vertical = "BOTTOM";
      } else if(vertical == "BOTTOM") {
        if(!this.selectedComponent.bottomResize(deltaMovement.y)) vertical = "TOP";
      }
      if(horizontal == "LEFT") {
        if(!this.selectedComponent.leftResize(deltaMovement.x)) horizontal = "RIGHT";
      } else if(horizontal == "RIGHT") {
        if(!this.selectedComponent.rightResize(deltaMovement.x)) horizontal = "LEFT";
      }
      mode = "RESIZE-COMBINE_" + vertical + "_" + horizontal;
    }
    this.mouseMode = mode;
  }

  updateCursor = () => {
    // Setup the cursor mode according to mouse mode
    let mouseCursorMode = "NONE";
    if(this.mouseMode == "SELECT") mouseCursorMode =  "SELECT";
    else if(this.mouseMode == "SELECTED") mouseCursorMode = this.mouseSubMode;
    // Set the cursor according to the cursor mode
    if(mouseCursorMode == "SELECT") this.app.bodyElement.style.cursor = 'default';
    else if(mouseCursorMode == "MOVE") this.app.bodyElement.style.cursor = 'move';
    else if(mouseCursorMode == "RESIZE_LEFT" || mouseCursorMode == "RESIZE_RIGHT") this.app.bodyElement.style.cursor = 'ew-resize';
    else if(mouseCursorMode == "RESIZE_TOP" || mouseCursorMode == "RESIZE_BOTTOM") this.app.bodyElement.style.cursor = 'ns-resize';
    else if(mouseCursorMode == "RESIZE-COMBINE_TOP_LEFT" || mouseCursorMode == "RESIZE-COMBINE_BOTTOM_RIGHT") this.app.bodyElement.style.cursor = 'nwse-resize';
    else if(mouseCursorMode == "RESIZE-COMBINE_TOP_RIGHT" || mouseCursorMode == "RESIZE-COMBINE_BOTTOM_LEFT") this.app.bodyElement.style.cursor = 'nesw-resize';
  }

  update = () => {
    // Update the view
    this.updateCursor();
    this.canvasHTML.update();
  }
}

export default Designer;