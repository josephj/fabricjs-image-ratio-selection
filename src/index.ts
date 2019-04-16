import { fabric } from "fabric";
import { getOrientation, resetOrientation } from "./utils";

const { Canvas } = fabric;

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
