import React, {
  useRef,
  useLayoutEffect
} from "react";
// import "./styles.css";
import { init } from "universalviewer";

const UV = ({manifest, width = '100vw', height = '100vh'}) => {
  const el = useRef();

  useLayoutEffect(() => {

    const uv = init(el.current,
      {
        manifestUri: manifest,
        config: {
          "options":{
            "theme": 'uv-cy-GB-theme'
          }
        }
      });

    uv.on('created', () => {
      uv.resize();
    }, false);

  }, [manifest]);

  return <div ref={el} id="uv" className="uv" style={{
    width: width,
    height: height
  }} />;
};

export default function UniversalViewer(props) {
  return (
    <UV manifest={props.manifest} width="100%" height="75vh" />
    // <UV manifest="https://iiif.wellcomecollection.org/presentation/v2/b18035723" width="50vw" height="50vh" />
    // <UV manifest="http://150.136.1.167/iiif/3/1921/manifest" width="50vw" height="50vh" />
    // <UV manifest="https://wellcomelibrary.org/iiif/b18035723/manifest" width="50vw" height="50vh" />
    // <UV manifest="https://iiif.riksarkivet.se/arkis!R0000004/manifest" width="50vw" height="50vh" />
    // <UV manifest="http://bluemountain.princeton.edu/exist/restxq/iiif/bmtnaae_1918-12_01/manifest" width="50vw" height="50vh" />
  );
}