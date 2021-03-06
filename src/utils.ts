import { ViewportInfo } from './interfaces';

export const needSelection = (
  viewportInfo: ViewportInfo,
  printWidth: number,
  printHeight: number
) => {
  const { scaledWidth, scaledHeight } = viewportInfo;
  const { selectionWidth, selectionHeight } = getSelectionInfo(
    printWidth,
    printHeight,
    scaledWidth,
    scaledHeight
  );
  return (
    Math.ceil(selectionWidth) !== Math.ceil(scaledWidth) ||
    Math.ceil(selectionHeight) !== Math.ceil(scaledHeight)
  );
};

export const getViewportInfo = (
  naturalWidth: number,
  naturalHeight: number,
  canvasSize: number
): ViewportInfo => {
  const isLandscape: boolean = naturalWidth >= naturalHeight;
  const ratio: number = isLandscape ? canvasSize / naturalWidth : canvasSize / naturalHeight;
  const scaledWidth = isLandscape ? canvasSize : naturalWidth * ratio;
  const scaledHeight = isLandscape ? naturalHeight * ratio : canvasSize;
  const top = isLandscape ? canvasSize / 2 - scaledHeight / 2 : 0;
  const left = isLandscape ? 0 : canvasSize / 2 - scaledWidth / 2;
  const scaleX = scaledWidth / naturalWidth;
  const scaleY = scaledHeight / naturalHeight;

  return {
    isLandscape,
    ratio,
    scaledWidth,
    scaledHeight,
    top,
    left,
    scaleX,
    scaleY,
    width: naturalWidth,
    height: naturalHeight,
  };
};

export const getSelectionInfo = (
  printWidth: number,
  printHeight: number,
  scaledWidth: number,
  scaledHeight: number
) => {
  let selectionWidth = 0;
  let selectionHeight = 0;
  if (printHeight * (scaledWidth / printWidth) <= scaledHeight) {
    selectionWidth = scaledWidth;
    selectionHeight = printHeight * (scaledWidth / printWidth);
  } else {
    selectionWidth = printWidth * (scaledHeight / printHeight);
    selectionHeight = scaledHeight;
  }
  return {
    selectionWidth,
    selectionHeight,
  };
};

export function getOrientation(file: any) {
  return new Promise(resolve => {
    var reader = new FileReader();
    reader.onload = (e: any) => {
      var view = new DataView(e.target.result);
      if (view.getUint16(0, false) != 0xffd8) {
        resolve(-2);
        return;
      }
      var length = view.byteLength,
        offset = 2;
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) {
          resolve(-1);
          return;
        }
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xffe1) {
          if (view.getUint32((offset += 2), false) != 0x45786966) {
            resolve(-1);
            return;
          }

          var little = view.getUint16((offset += 6), false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;
          for (var i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) == 0x0112) {
              resolve(view.getUint16(offset + i * 12 + 8, little));
              return;
            }
          }
        } else if ((marker & 0xff00) != 0xff00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      resolve(-1);
    };
    reader.readAsArrayBuffer(file);
  });
}

export function resetOrientation(srcBase64: string, srcOrientation: number) {
  return new Promise(resolve => {
    var img = new Image();

    img.onload = function() {
      var width = img.width,
        height = img.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

      // set proper canvas dimensions before transform & export
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // transform context before drawing image
      switch (srcOrientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, width, 0);
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, width, height);
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, height);
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, height, 0);
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, height, width);
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, width);
          break;
        default:
          break;
      }

      // draw image
      ctx.drawImage(img, 0, 0);

      // export base64
      resolve(canvas.toDataURL());
    };

    img.src = srcBase64;
  });
}
