import App from "../Droo/App/App";
import canvasHTML from "../Droo/Canvas/CanvasHTML";
import Vector2 from "../Droo/Structures/Vector2";
import FrameComponentHTML from "../Droo/Mesh/FrameComponentHTML";
import ComponentHTML from "../Droo/Mesh/ComponentHTML";
import AutoLayoutHint from "./AutoLayoutHint";

class Designer {
  app: App;
  canvasHTML: canvasHTML;
  mouseMode: string;
  mouseSubMode: string;
  autoLayoutHint: AutoLayoutHint;
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
    this.autoLayoutHint = new AutoLayoutHint(this.canvasHTML, "#0096FF");
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
    let checkSelect = false;
    if(this.mouseMode == "SELECT") {
      if(this.canvasHTML.mouse.leftDown) checkSelect = true;
    }
    else if (this.mouseMode == "SELECTED" && this.mouseSubMode == "SELECT") {
      if(this.canvasHTML.mouse.leftDown) checkSelect = true;
    }
    // ---------------------------------------------------------------- //
    // If mouse modes allows selection, then perform a selection test at mouse position
    if(checkSelect) {
      this.selectComponent(position);
    }
  }

  onMouseMove = (ev: MouseEvent) => {
    // Get the position in screen coordinates
    const position = this.canvasHTML.getScreenPosition(new Vector2(ev.clientX, ev.clientY));
    // Check if resizing can be done
    let checkResize = false;
    if (this.mouseMode.startsWith("RESIZE")) {
      // If resize is enabled but mouse left button is not pressed, reset mode back to selected
      if(this.canvasHTML.mouse.leftDown) checkResize = true;
      else this.mouseMode = "SELECTED";
    }
    // Check if movement can be done
    let checkMove = false;
    if (this.mouseMode == "MOVE") {
      // If move is enabled but mouse left button is not pressed, reset mode back to selected
      if(this.canvasHTML.mouse.leftDown) checkMove = true;
      else this.mouseMode = "SELECTED";
    }
    // Check if mouse over selected component check can be done
    let checkOverSelected = false;
    if (this.mouseMode == "SELECTED") checkOverSelected = true;
    // ---------------------------------------------------------------- //
    // If mouse component is selected, then check if mouse is over it for move and resize
    if(checkOverSelected) {
      this.mouseSubMode = this.checkForResizeAndDrag(position);
      // If left mouse button is pressed then copy mouse sub mode to mouse mode
      if(this.canvasHTML.mouse.leftDown) this.mouseMode = this.mouseSubMode;
    }
    // If mouse modes allows resize, then resize
    else if (checkResize) {
      this.resize(this.canvasHTML.mouse.deltaMovement);
    }
    // If mouse modes allows move, then move
    else if (checkMove) {
      this.move(this.canvasHTML.mouse.deltaMovement, position);
    } 
    // Update after move event
    this.update();
  }

  onMouseUp = (ev: MouseEvent) => {
    // Get the position in screen coordinates
    const position = this.canvasHTML.getScreenPosition(new Vector2(ev.clientX, ev.clientY));
    // Check if resizing is done
    let checkPostResize = false;
    if (this.mouseMode.startsWith("RESIZE")) {
      // If left mouse button is not pressed then resize is just finished, so reset the mode back to selected and enable post resize
      if(!this.canvasHTML.mouse.leftDown) {
        this.mouseMode = "SELECTED";
        checkPostResize = true;
      }
    }
    // Check if movement is done
    let checkPostMove = false;
    if (this.mouseMode == "MOVE") {
      // If left mouse button is not pressed then resize is just finished, so reset the mode back to selected and enable post move
      if(!this.canvasHTML.mouse.leftDown) {
        this.mouseMode = "SELECTED";
        checkPostMove = true;
      }
    }
    // Check if mouse over selected component check can be done
    let checkOverSelected = false;
    if (this.mouseMode == "SELECTED") checkOverSelected = true;
    // ---------------------------------------------------------------- //
    // If mouse resize is completed, then do post resize job
    if(checkPostResize) {
      this.postResize(position);
    }
    // If mouse move is completed, then do post move job
    if(checkPostMove) {
      this.postMove(position);
    }
    // If mouse component is selected, then check if mouse is over it for move and resize
    if(checkOverSelected) {
      this.mouseSubMode = this.checkForResizeAndDrag(position);
    } 
    // Update after move event
    this.update();
  }

  selectComponent = (position: Vector2) => { 
    // Unselect the previously selected component
    if(this.selectedComponent) {
      this.selectedComponent.outlineMode = false;
      this.selectedComponent = null;
    }
    // If component is selected then draw its outline and change mouse mode accordingly
    this.selectedComponent = this.canvasHTML.pickComponentByShape(position);
    if(this.selectedComponent) {
      this.selectedComponent.outlineStyle = "SOLID";
      this.selectedComponent.outlineMode = true;
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

  move = (deltaMovement: Vector2, position: Vector2) => {
    // If component is selected, move it by delta movement values
    if(this.selectedComponent) {
      let parentChanged = false;
      let oldSelectedComponentParent = this.selectedComponent.parent;
      this.selectedComponent.outlineMode = false;
      this.selectedComponent.move(new Vector2(deltaMovement.x, deltaMovement.y));
      // Remove the data of old frame container
      if(this.ComponentFrameContainer) {
        this.ComponentFrameContainer.outlineMode = false;
        this.ComponentFrameContainer = null;
      }
      // If selected component can be added to a frame, then update the data for new frame container
      // If auto layout hint outline is enabled then use it instead of selected component to pick parent frame
      if(this.autoLayoutHint.hintOutlineEnabled) {
        (this.selectedComponent as FrameComponentHTML).isParentableAllBelow = false;
        this.ComponentFrameContainer = this.canvasHTML.pickComponentFrameContainer(position, this.autoLayoutHint.hintOutline); 
        (this.selectedComponent as FrameComponentHTML).isParentableAllBelow = true;
      }
      // If place holder outline is not present then use selected component to pick parent frame
      else {
        this.ComponentFrameContainer = this.canvasHTML.pickComponentFrameContainer(position, this.selectedComponent); 
      }
      // If frame container exists then it can add selected component
      if(this.ComponentFrameContainer) {
        // Draw the frame continer outline
        this.ComponentFrameContainer.outlineStyle = "SOLID";
        this.ComponentFrameContainer.outlineMode = true;
        // If selected component has a different parent
        if(this.ComponentFrameContainer.id !== this.selectedComponent.parent.id) {
          // Remove the place holder components if they exists
          this.removePlaceHolders();
          // If frame container has free layout then add selected component as active to new frame container
          if((this.ComponentFrameContainer as FrameComponentHTML).layout == "FREE") {
            parentChanged = true;
            this.canvasHTML.addComponent(this.selectedComponent, this.ComponentFrameContainer);
            this.selectedComponent.active = true;
          }
          // If frame container has auto layout then add selected component as inactive to new frame container
          else if((this.ComponentFrameContainer as FrameComponentHTML).layout == "AUTO") {
            this.selectedComponent.active = false;
            parentChanged = true;
            this.canvasHTML.addComponent(this.selectedComponent, this.ComponentFrameContainer);
            // Enable the auto layout hint outline component to follow selected component to indicate movement in auto layout frame
            this.autoLayoutHint.enableHintOutline(Vector2.getAddedVector(this.ComponentFrameContainer.position, this.selectedComponent.localPosition), this.selectedComponent.width, this.selectedComponent.height);
            // Enable the auto layout hint marker to indicate where the new object will be placed, by calculating its position from parent container using child index
            this.autoLayoutHint.enableHintMarker(this.ComponentFrameContainer as FrameComponentHTML, position, this.selectedComponent.width, this.selectedComponent.height);
          }
        }
        // If selected component has same parent
        else {
          // If existing frame container has auto layout
          if((this.ComponentFrameContainer as FrameComponentHTML).layout == "AUTO") {
            // If auto layout hint outline enabled then move it along with selected component
            if(this.autoLayoutHint.hintOutlineEnabled) {
              this.autoLayoutHint.moveHintOutline(new Vector2(deltaMovement.x, deltaMovement.y));
            }
            // If auto layout hint outline not enabled then enable it to follow selected component to indicate movement in auto layout frame
            else {
              this.selectedComponent.setLocalFromAuto();
              this.autoLayoutHint.enableHintOutline(Vector2.getAddedVector(this.ComponentFrameContainer.position, this.selectedComponent.localPosition), this.selectedComponent.width, this.selectedComponent.height);
            }
            // If auto layout hint marker is enabled then change it position according to current mouse position
            if(this.autoLayoutHint.hintMarkerEnabled) {
              this.autoLayoutHint.updateHintMarker(position);
            }
            else {
              // Enable hint auto layout hint marker to indicate where the new object will be placed, by calculating its position from parent container using child index
              this.autoLayoutHint.enableHintMarker(this.ComponentFrameContainer as FrameComponentHTML, position, this.selectedComponent.width, this.selectedComponent.height);
            }
            // If auto layout hint marker is enabled, then make it unactive if its newly calculated index position is same
            if(this.autoLayoutHint.hintMarkerEnabled) {
              if(this.selectedComponent.active) {
                if(this.isIndexPositionValid((this.ComponentFrameContainer as FrameComponentHTML), position)) this.autoLayoutHint.hintMarker.active = true;
                else this.autoLayoutHint.hintMarker.active = false;
              }              
            }
          }
        }
      }
      // If frame container does not exist then remove the selected object from any frame container and add it back to canvas
      else {
        // Add it back to canvas if its not already at root
        if(!this.selectedComponent.parent.isRoot) {
          parentChanged = true;
          this.canvasHTML.addComponent(this.selectedComponent);
          this.selectedComponent.active = true;
        }
        // Disable the auto layout hint outline component if its enabled
        if(this.autoLayoutHint.hintOutlineEnabled) {
          this.autoLayoutHint.disableHintOutline();
        }
        // Disable the auto layout hint marker component if its enabled
        if(this.autoLayoutHint.hintMarkerEnabled) {
          this.autoLayoutHint.disableHintMarker();
        }
      }
      // If parent is changed from last event call
      if(parentChanged) {
        // If old parent of selected component was frame with auto layout, then change local position of all components in it to their auto local positions
        if(oldSelectedComponentParent && oldSelectedComponentParent.type == "FRAME" && (oldSelectedComponentParent as FrameComponentHTML).layout == "AUTO")
        {
          for(let i=0; i<oldSelectedComponentParent.children.length; i++) {
            oldSelectedComponentParent.children[i].setLocalFromAuto();
          }
        }
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

  postResize = (position: Vector2) => {

  }

  postMove = (position: Vector2) => {
    // If component is selected then enable its outline
    if(this.selectedComponent) {
      this.selectedComponent.outlineStyle = "SOLID";
      this.selectedComponent.outlineMode = true;
      if(this.selectedComponent.parent.type == "FRAME") {
        // If parent frame has auto layout
        if((this.selectedComponent.parent as FrameComponentHTML).layout == "AUTO") {
          // If selected component is already active, then only add if its newly calculated index position is not same
          if(this.selectedComponent.active) {
            if(this.isIndexPositionValid((this.ComponentFrameContainer as FrameComponentHTML), position)) {
              let newIndex = (this.selectedComponent.parent as FrameComponentHTML).getChildIndexForAutoLayout(position);
              this.selectedComponent.parent.changeChildIndex(this.selectedComponent, newIndex);
            }
          }
          // If selected component state not active, then make it active and move it to newly calculated index position
          else {
            let newIndex = (this.selectedComponent.parent as FrameComponentHTML).getChildIndexForAutoLayout(position);
            this.selectedComponent.parent.changeChildIndex(this.selectedComponent, newIndex);
            this.selectedComponent.active = true;
          }
          // Change local position of all components in parent to their auto local positions
          for(let i=0; i<this.selectedComponent.parent.children.length; i++) {
            this.selectedComponent.parent.children[i].setLocalFromAuto();
          }
        }
      }
    }
    // If frame container exists because it can add selected component
    if(this.ComponentFrameContainer) {
      // Disable the outline of the frame container
      this.ComponentFrameContainer.outlineMode = false;
      this.ComponentFrameContainer = null;
    }
    // Remove the place holder components if they exists
    this.removePlaceHolders();
  }

  isIndexPositionValid = (frame: FrameComponentHTML, position: Vector2) => {
    // If frame layout is auto then calculate valid index position
    if(frame.layout == "AUTO") {
      const currentIndex = frame.getChildIndex(this.selectedComponent);
      const newIndex = frame.getChildIndexForAutoLayout(position);
      if(currentIndex == newIndex || currentIndex+1 == newIndex) return false;
      else return true;
    }
  }

  removePlaceHolders = () => {
    // Disable the auto layout hint outline component if its enabled
    if(this.autoLayoutHint.hintOutlineEnabled) {
      this.autoLayoutHint.disableHintOutline();
    }
    // Disable the auto layout hint marker component if its enabled
    if(this.autoLayoutHint.hintMarkerEnabled) {
      this.autoLayoutHint.disableHintMarker();
    }
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
    if(this.autoLayoutHint.hintOutlineEnabled) this.autoLayoutHint.hintOutline.render(this.canvasHTML.rendererHTML);
    if(this.autoLayoutHint.hintMarkerEnabled) this.autoLayoutHint.hintMarker.render(this.canvasHTML.rendererHTML);
  }

  setupDemo = () => {
    const a = new FrameComponentHTML(new Vector2(50,50), 200, 200, "#FFBF00");
    const b = new FrameComponentHTML(new Vector2(300,50), 200, 200, "#AAFFFF", "AUTO", "HORIZONTAL");
    const c = new FrameComponentHTML(new Vector2(700,50), 200, 200, "#7665C0", "AUTO", "VERTICAL");
    const x = new FrameComponentHTML(new Vector2(500,400), 50, 50, "#0FFF00");
    const y = new FrameComponentHTML(new Vector2(600,400), 80, 80, "#FF0000");
    const z = new FrameComponentHTML(new Vector2(700,400), 80, 80, "#FFF00F");
    this.canvasHTML.addComponent(a);
    this.canvasHTML.addComponent(b);
    this.canvasHTML.addComponent(c);
    this.canvasHTML.addComponent(x);
    this.canvasHTML.addComponent(y);
    this.canvasHTML.addComponent(z);
    this.update();
  }
}

export default Designer;