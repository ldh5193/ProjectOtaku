declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement, options?: MapOptions);
    setCenter(latlng: LatLng): void;
    setZoom(zoom: number, effect?: boolean): void;
  }

  interface MapOptions {
    center?: LatLng;
    zoom?: number;
    zoomControl?: boolean;
    zoomControlOptions?: { position?: number };
    draggable?: boolean;
    scrollWheel?: boolean;
    keyboardShortcuts?: boolean;
    disableDoubleTapZoom?: boolean;
    disableDoubleClickZoom?: boolean;
    disableTwoFingerTapZoom?: boolean;
  }

  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setIcon(icon: string | ImageIcon | HtmlIcon | null): void;
    getPosition(): LatLng;
    getElement(): HTMLElement;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map | null;
    title?: string;
    icon?: string | ImageIcon | HtmlIcon;
  }

  interface ImageIcon {
    url: string;
    size: Size;
    anchor: Point;
  }

  interface HtmlIcon {
    content: string;
    size: Size;
    anchor: Point;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    setContent(content: string): void;
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  interface InfoWindowOptions {
    content?: string;
    maxWidth?: number;
    borderWidth?: number;
    borderColor?: string;
    backgroundColor?: string;
    anchorSize?: Size;
    pixelOffset?: Point;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Event {
    function addListener(
      target: object,
      type: string,
      listener: (...args: unknown[]) => void
    ): void;
    function removeListener(listener: object): void;
  }

  const Position: {
    TOP_RIGHT: number;
    TOP_LEFT: number;
    BOTTOM_RIGHT: number;
    BOTTOM_LEFT: number;
  };
}
