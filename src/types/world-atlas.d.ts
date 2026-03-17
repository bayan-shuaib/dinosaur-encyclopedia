declare module 'world-atlas/countries-110m.json' {
  const data: {
    type: 'Topology';
    objects: {
      countries: import('topojson-specification').GeometryCollection;
      land: import('topojson-specification').GeometryCollection;
    };
    arcs: number[][][];
    transform: { scale: [number, number]; translate: [number, number] };
  };
  export default data;
}
