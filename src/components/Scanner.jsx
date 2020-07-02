import React, { Children, cloneElement, Component, createRef } from "react";
import { bool, func, node, object } from "prop-types";
import Instascan from "instascan-umd-new";
import nil from "../utils/nil";

export default class Scanner extends Component {
  displayName = "Scanner";

  static propTypes = {
    children: node.isRequired,
    camera: object.isRequired,
    onStart: func,
    onStop: func,
    onScan: func,
    onActive: func,
    onInactive: func,
    stop: bool,
    options: object
  };

  _scanner = null;
  _videoRef = null;

  constructor(props) {
    super(props);
    this._videoRef = React.createRef();
  }

  shouldComponentUpdate({ stop, onStart = nil, onStop = nil, camera }) {
    if (this._scanner) {
      stop
        ? this._scanner
            .stop()
            .then(onStop)
            .catch(onStop)
        : this._scanner
            .start(camera)
            .then(onStart)
            .catch(onStart);
    }

    return false;
  }

  componentDidMount() {
    const {
      options = {},
      camera,
      stop,
      onScan = nil,
      onActive = nil,
      onInactive = nil
    } = this.props;

    this._scanner = new Instascan.Scanner({ ...options, video: this._videoRef.current });
    if (!stop) {
      this._scanner.addListener("scan", onScan);
    }
    this._scanner.addListener("active", onActive);
    this._scanner.addListener("inactive", onInactive);

    this._scanner.start(camera);
  }

  componentWillUnmount() {
    this._scanner.removeAllListeners();
    this._scanner.stop();
  }

  render() {
    const video = Children.only(this.props.children);
    if (video.type === "video") {
      return cloneElement(video, { ref: this._videoRef });
    } else {
      return <p>No Video element child at Scanner</p>;
    }
  }
}
