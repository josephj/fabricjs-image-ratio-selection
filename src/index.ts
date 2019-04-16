import { fabric } from "fabric";
import { getOrientation, resetOrientation } from "./utils";

const { Canvas } = fabric;

// const SIZE = [152.4, 101.6];
// const SIZE = [152.4, 152.4];
const SIZE = [152.4, 203.2];

const handleImageLoad = dataURL => e => {
  const imgEl = e.target;
  const naturalWidth: number = imgEl.naturalWidth;
  const naturalHeight: number = imgEl.naturalHeight;
  const isLandscape: boolean = naturalWidth > naturalHeight;
  const ratio: number = isLandscape ? 500 / naturalWidth : 500 / naturalHeight;
  const scaledWidth = isLandscape ? 500 : naturalWidth * ratio;
  const scaledHeight = isLandscape ? naturalHeight * ratio : 500;
  const top = isLandscape ? 500 / 2 - scaledHeight / 2 : 0;
  const left = isLandscape ? 0 : 500 / 2 - scaledWidth / 2;

  const canvasEl = document.createElement("canvas");
  canvasEl.setAttribute("width", "500");
  canvasEl.setAttribute("height", "500");
  document.querySelector("#container").appendChild(canvasEl);
  const canvas = new Canvas(canvasEl);
  canvas.backgroundColor = "#ccc";

  canvas.on("object:moving", function(e) {
    var obj = e.target;
    // if object is too big ignore
    if (
      obj.height > obj.canvas.getHeight() ||
      obj.width > obj.canvas.getWidth()
    ) {
      return;
    }
    obj.setCoords();
    // top-left  corner
    if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
      obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
      obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
    }
    // bot-right corner
    if (
      obj.getBoundingRect().top + obj.getBoundingRect().height >
        obj.canvas.getHeight() ||
      obj.getBoundingRect().left + obj.getBoundingRect().width >
        obj.canvas.getWidth()
    ) {
      obj.top = Math.min(
        obj.top,
        obj.canvas.getHeight() -
          obj.getBoundingRect().height +
          obj.top -
          obj.getBoundingRect().top
      );
      obj.left = Math.min(
        obj.left,
        obj.canvas.getWidth() -
          obj.getBoundingRect().width +
          obj.left -
          obj.getBoundingRect().left
      );
    }
  });

  fabric.Image.fromURL(dataURL, img => {
    img.set({
      backgroundColor: "red",
      width: naturalWidth,
      height: naturalHeight,
      top,
      left,
      scaleX: scaledWidth / naturalWidth,
      scaleY: scaledHeight / naturalHeight,
      selectable: false,
      objectCaching: false
    });
    canvas.add(img);

    const rect = new fabric.Rect({
      backgroundColor: "#000",
      opacity: 0.5,
      width: scaledWidth,
      height: scaledHeight,
      top,
      left,
      selectable: false
    });
    rect.lockMovementX = true;
    rect.lockMovementY = true;
    rect.moveCursor = "default";
    rect.setControlsVisibility({
      bl: false,
      br: false,
      mb: false,
      ml: false,
      mr: false,
      mt: false,
      tl: false,
      tr: false,
      mtr: false
    });
    canvas.add(rect);

    let selectionWidth = 0;
    let selectionHeight = 0;
    if (SIZE[1] * (scaledWidth / SIZE[0]) <= scaledHeight) {
      selectionWidth = scaledWidth;
      selectionHeight = SIZE[1] * (scaledWidth / SIZE[0]);
    } else {
      selectionWidth = SIZE[0] * (scaledHeight / SIZE[1]);
      selectionHeight = scaledHeight;
    }
    if (selectionWidth !== scaledWidth || selectionHeight !== scaledHeight) {
      const selection = new fabric.Rect({
        backgroundColor: "white",
        opacity: 0.5,
        width: selectionWidth,
        height: selectionHeight,
        top: top + (scaledHeight - selectionHeight) / 2,
        left: left + (scaledWidth - selectionWidth) / 2,
        selectable: true,
        borderDashArray: [1, 2],
        borderColor: "#fff",
        lockMovementX: selectionWidth === scaledWidth,
        lockMovementY: selectionHeight === scaledHeight,
        lockUniScaling: true
      });

      selection.setControlsVisibility({
        bl: false,
        br: false,
        mb: false,
        ml: false,
        mr: false,
        mt: false,
        tl: false,
        tr: false,
        mtr: false
      });
      canvas.add(selection);
    }
  });
};

const handleReaderLoad = file => async e => {
  const dataURL = e.target.result;
  const orientation = await getOrientation(file);
  const newDataURL: string = await resetOrientation(dataURL, orientation);

  const imgEl = new Image();
  imgEl.onload = handleImageLoad(newDataURL);
  imgEl.src = newDataURL;
};

const handleFileChange = e => {
  const input = e.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = handleReaderLoad(input.files[0]);
    reader.readAsDataURL(input.files[0]);
  }
};

document.querySelector("#file").addEventListener("change", handleFileChange);
