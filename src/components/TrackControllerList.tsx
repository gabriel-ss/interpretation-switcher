import * as React from "react";
import Track from "../playback-handler/Track";
import {RadioGroup} from "@material-ui/core";
import TrackController from "./TrackController";


interface Props {

	trackList: Track[];
	selectedTrack: number;
	isPlaying: boolean;
	setTrackPosition: Function;
	setSelectedTrack: Function;
	removeTrack: Function;

}

class TrackControllerList extends React.Component<Props> {

	public render(): JSX.Element {

		const trackList =
			this.props.trackList.map((track, key) =>
				<TrackController
					key={key}
					track={track}
					setPosition={this.props.setTrackPosition(key)}
					selectTrack={this.props.setSelectedTrack(key)}
					removeTrack={this.props.removeTrack(key)}
					isSelected={key === this.props.selectedTrack}
				/>);

		return (
			<RadioGroup style={style}>{trackList.reverse()}</RadioGroup>
		);

	}

}


const style = {

	minWidth: 360,
	width: "60%",

};

export default TrackControllerList;
