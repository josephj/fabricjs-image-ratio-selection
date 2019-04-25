import { fabric } from 'fabric';
import {
  getViewportInfo,
  getSelectionInfo,
  getOrientation,
  resetOrientation,
  needSelection,
} from './utils';
import { ViewportInfo } from './interfaces';

const { Canvas } = fabric;

const applyCanvas = (canvasSize = 500) => {
  const canvasEl = document.createElement('canvas');
  canvasEl.setAttribute('width', `${canvasSize}`);
  canvasEl.setAttribute('height', `${canvasSize}`);
  document.querySelector('#container').appendChild(canvasEl);

  return new Canvas(canvasEl, {
    backgroundColor: '#ccc',
    selection: false,
    defaultCursor: 'default',
  });
};

const appendImage = (canvas: fabric.Canvas, dataURL: string, viewportInfo: ViewportInfo) => {
  return new Promise(resolve => {
    const { width, height, top, left, scaleX, scaleY } = viewportInfo;
    fabric.Image.fromURL(dataURL, img => {
      img.set({
        width,
        height,
        top,
        left,
        scaleX,
        scaleY,
        objectCaching: false,
        selectable: false,
        moveCursor: 'default',
      });
      canvas.add(img);
      resolve(img);
    });
  });
};

const createMask = (options = {}): fabric.Rect => {
  const mask = new fabric.Rect({
    fill: '#000000',
    opacity: 0.5,
    selectable: false,
    lockMovementX: true,
    lockMovementY: true,
    moveCursor: 'default',
    ...options,
  });
  mask.setControlsVisibility({
    bl: false,
    br: false,
    mb: false,
    ml: false,
    mr: false,
    mt: false,
    tl: false,
    tr: false,
    mtr: false,
  });
  return mask;
};

const appendMasks = (canvas: fabric.Canvas, selection: fabric.Rect, viewportInfo: ViewportInfo) => {
  const { top, left, scaledWidth, scaledHeight } = viewportInfo;
  var x0 = left;
  var x1 = selection.left;
  var x2 = selection.left + selection.getScaledWidth();
  var x3 = left + scaledWidth;
  var y0 = top;
  var y1 = selection.top;
  var y2 = selection.top + selection.getScaledHeight();
  var y3 = top + scaledHeight;

  const masks = {
    top: createMask({ top: y0, left: x0, width: x3 - x0, height: y1 - y0 }),
    bottom: createMask({ top: y2, left: x0, width: x3 - x0, height: y3 - y2 }),
    left: createMask({ top: y1, left: x0, width: x1 - x0, height: y2 - y1 }),
    right: createMask({ top: y1, left: x2, width: x3 - x2, height: y2 - y1 }),
  };

  canvas.add(masks.top);
  canvas.add(masks.bottom);
  canvas.add(masks.left);
  canvas.add(masks.right);

  return masks;
};

const appendSelection = (
  canvas: fabric.Canvas,
  printWidth: number,
  printHeight: number,
  viewportInfo: ViewportInfo
): fabric.Rect => {
  const { top, left, scaledWidth, scaledHeight } = viewportInfo;
  const { selectionWidth, selectionHeight } = getSelectionInfo(
    printWidth,
    printHeight,
    scaledWidth,
    scaledHeight
  );
  const selection = new fabric.Rect({
    opacity: 0,
    width: selectionWidth,
    height: selectionHeight,
    top: top + (scaledHeight - selectionHeight) / 2,
    left: left + (scaledWidth - selectionWidth) / 2,
    selectable: true,
    // borderDashArray: [1, 2],
    // borderColor: 'rgba(255, 255, 255, 1)',
    lockMovementX: selectionWidth === scaledWidth,
    lockMovementY: selectionHeight === scaledHeight,
    lockUniScaling: true,
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
    mtr: false,
  });
  canvas.add(selection);
  return selection;
};

const bindSelectionMove = (
  canvas: fabric.Canvas,
  img: fabric.Image,
  masks: any,
  viewportInfo: ViewportInfo
) => {
  canvas.on('object:moving', e => {
    const obj = e.target;
    const imgBoundingRect = img.getBoundingRect();
    const selectionBoundingRect = obj.getBoundingRect();
    obj.setCoords();

    // top
    if (selectionBoundingRect.top < imgBoundingRect.top) {
      obj.top = imgBoundingRect.top;
    } else if (
      selectionBoundingRect.top + obj.getScaledHeight() >
      imgBoundingRect.top + img.getScaledHeight()
    ) {
      obj.top = imgBoundingRect.top + img.getScaledHeight() - obj.getScaledHeight();
    }

    // left
    if (selectionBoundingRect.left < imgBoundingRect.left) {
      obj.left = imgBoundingRect.left;
    } else if (
      selectionBoundingRect.left + obj.getScaledWidth() >
      imgBoundingRect.left + img.getScaledWidth()
    ) {
      obj.left = imgBoundingRect.left + img.getScaledWidth() - obj.getScaledWidth();
    }

    const { top, left, scaledWidth, scaledHeight } = viewportInfo;
    var x0 = left;
    var x1 = obj.left;
    var x2 = obj.left + obj.getScaledWidth();
    var x3 = left + scaledWidth;
    var y0 = top;
    var y1 = obj.top;
    var y2 = obj.top + obj.getScaledHeight();
    var y3 = top + scaledHeight;

    masks.top.set({ top: y0, left: x0, width: x3 - x0, height: y1 - y0 });
    masks.bottom.set({ top: y2, left: x0, width: x3 - x0, height: y3 - y2 });
    masks.left.set({ top: y1, left: x0, width: x1 - x0, height: y2 - y1 });
    masks.right.set({ top: y1, left: x2, width: x3 - x2, height: y2 - y1 });
  });
};

const loadFile = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      resolve(e.target.result);
    };
    reader.onerror = (err: any) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};

const loadImage = (dataURL: string) => {
  return new Promise((resolve, reject) => {
    const imgEl: HTMLImageElement = new Image();
    imgEl.onload = (e: Event) => resolve(e.target);
    imgEl.onerror = (e: Event) => reject(e);
    imgEl.src = dataURL;
  });
};

const handleFileChange = async (e: Event) => {
  const input = <HTMLInputElement>e.target;
  if (!input.files || !input.files.length) {
    return;
  }

  const orientationEl = <HTMLInputElement>document.getElementById('orientation');

  Array.from(input.files).forEach(async file => {
    const itemEl = document.createElement('div');
    itemEl.className = 'box';

    let dataURL: string = <string>await loadFile(file);
    if (orientationEl.checked) {
      const orientation = <number>await getOrientation(file);
      dataURL = <string>await resetOrientation(dataURL, orientation);
    }
    const imgEl: HTMLImageElement = <HTMLImageElement>await loadImage(dataURL);

    const canvas = applyCanvas(500);
    const viewportInfo = getViewportInfo(imgEl.naturalWidth, imgEl.naturalHeight, 500);
    const isLandscape = imgEl.naturalWidth > imgEl.naturalHeight;
    const img: fabric.Image = <fabric.Image>await appendImage(canvas, dataURL, viewportInfo);

    const sizeEl: HTMLSelectElement = <HTMLSelectElement>document.getElementById('size');
    const printSize = sizeEl.options[sizeEl.selectedIndex].value.split(',');
    const printWidth = isLandscape ? parseInt(printSize[1], 10) : parseInt(printSize[0], 10);
    const printHeight = isLandscape ? parseInt(printSize[0], 10) : parseInt(printSize[1], 10);
    if (needSelection(viewportInfo, printWidth, printHeight)) {
      const selection = appendSelection(canvas, printWidth, printHeight, viewportInfo);
      const masks = appendMasks(canvas, selection, viewportInfo);
      bindSelectionMove(canvas, img, masks, viewportInfo);
    }
  });

  input.value = '';
};

document.querySelector('#file').addEventListener('change', handleFileChange);
