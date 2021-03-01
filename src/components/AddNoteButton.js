import React from "react";
import { Button } from "antd";
import { PATH_PREFIX } from "../utils/Utils";
// targets

const AddNoteButton = (props) => {
  
  const onNoteAdd = () => {
    let data = props.targets
    var linksToBeAdded = []
    console.log(data)
    // let win = window.open(
    //   PATH_PREFIX + "/note/" + JSON.stringify(data),
    //   "_blank"
    // );
    // win.focus();

    for(var i = 0; i < data.length-1; i++){
      for(var j = i+1; j < data.length; j++){
        linksToBeAdded.push([data[i],data[j]])
      }
    }

    console.log(linksToBeAdded)
  };
  return <Button onClick={onNoteAdd}>Add Note</Button>;
};

export default AddNoteButton;