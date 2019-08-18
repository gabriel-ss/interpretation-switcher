import Track from "./playback-handler/Track";
import TrackImplementation from "./playback-handler/HowlerTrack";
import {PlayerController, TrackControllerList} from "./components";
import * as React from "react";
import {Fab} from "@material-ui/core";
import {Add} from "@material-ui/icons";
import {ipcRenderer} from "electron";
const {dialog} = require("electron").remote.require("electron");
const WINDOW_OVERLAP = 0;
const WINDOW_SIZE = 4096;
const SAMPLE_RATE = 44100;


interface State {

	trackList: Track[];
	selectedTrack: number;
	isPlaying: boolean;

}

export class App extends React.Component<{}, State> {

	public state = {
		trackList: [] as Track[],
		selectedTrack: 0,
		isPlaying: false,
	}


	public constructor(props) {

		super(props);
		ipcRenderer.on("trackAligned", (_event, alignment) => {

			this.state.trackList[this.state.trackList.length - 1].alignment =
				alignment.map((segment: Uint8Array) =>
					new Uint32Array(segment.buffer));

			this.syncTracks();

		});

	}


	public componentDidMount(): void {

		setInterval(() => {

			if (this.state.isPlaying) {

				this.syncTracks();
				this.setState({trackList: [...this.state.trackList]});

			}

		}, 250);

	}

	private setTrackPosition = (track: number) => (position: number) => {

		this
			.state
			.trackList[track]
			.currentPosition = position;

		this.syncTracks(track);

		this.setState({trackList: [...this.state.trackList]});

	}

	private addTrack = (): void => {

		const [path] = dialog.showOpenDialog({
			properties: ["openFile"],
			filters: [{name: "Audio Files", extensions: ["mp3", "wav"]}],
		}) || [null];

		if (!path) return;

		ipcRenderer.send("trackAdd", path);

		const track = new TrackImplementation(path);

		this.setState({trackList: [...this.state.trackList, track]});

	}

	private removeTrack = (track: number) => (): void => {

		if (this.state.isPlaying &&
			(track === this.state.selectedTrack)) {

			this.toggleReproduction();
			this.setSelectedTrack(0);

		}

		this.setState({trackList: [...this.state.trackList.splice(track, 1)]});

	}

	private setSelectedTrack = (track: number) => (): void => {

		const currentTrack = this.state.trackList[this.state.selectedTrack];

		this.syncTracks();

		if (this.state.isPlaying) {

			currentTrack.pause();
			this.state.trackList[track].play();

		}

		this.setState({selectedTrack: track});

	}

	private toggleReproduction = (): void => {

		const currentTrack = this.state.trackList[this.state.selectedTrack];

		if (!this.state.trackList.length) return;

		const {isPlaying} = this.state;

		currentTrack[isPlaying ? "pause" : "play"]();
		this.setState({isPlaying: !isPlaying});

	}


	public syncTracks(trackNumber?: number): void {

		const referenceTrack = trackNumber || trackNumber === 0
			? trackNumber : this.state.selectedTrack;

		const currentTrack = this.state.trackList[referenceTrack];

		if (!currentTrack) return;

		const {currentPosition, alignment} = currentTrack;
		// Evaluate the window where the current sample is
		const currentWindow = Math.floor(
			currentPosition * SAMPLE_RATE / (WINDOW_SIZE - WINDOW_OVERLAP)
		);

		let referenceWindow: number;

		// Find the corresponding window on the master track
		if (alignment) {

			const referenceIndex = alignment[1].indexOf(currentWindow);

			referenceWindow = alignment[0][referenceIndex];

		} else
			referenceWindow = currentWindow;


		this.state.trackList.filter(track => track !== currentTrack)
			.forEach(track => {

				let alignedWindow: number;

				// Align the track with the master track
				if (track.alignment) {

					const alignedIndex = track.alignment[0].indexOf(referenceWindow);

					alignedWindow = track.alignment[1][alignedIndex];

				} else
					alignedWindow = referenceWindow;

				track.currentPosition =
				alignedWindow * (WINDOW_SIZE - WINDOW_OVERLAP) / SAMPLE_RATE;

			});

	}


	public render(): JSX.Element {

		return (
			<React.Fragment>
				<div style={appStyle} className="App">
					<TrackControllerList
						trackList={this.state.trackList}
						selectedTrack={this.state.selectedTrack}
						isPlaying={this.state.isPlaying}
						setTrackPosition={this.setTrackPosition}
						setSelectedTrack={this.setSelectedTrack}
						removeTrack={this.removeTrack}
					/>
					<PlayerController
						isPlaying={this.state.isPlaying}
						toggleReproduction={this.toggleReproduction}
					/>
					<Fab
						style={buttonStyle}
						onClick={this.addTrack}
					>
						<Add/>
					</Fab>
				</div>
			</React.Fragment>
		);

	}

}

const appStyle = {

	backgroundColor: "#eeeeee",
	minHeight: "100vh",
	display: "flex",
	flexDirection: "column" as any,
	alignItems: "center",
	justifyContent: "center",
	fontSize: "calc(10px + 2vmin)",
	color: "#FFFFFF",

};

const buttonStyle = {

	position: "absolute" as any,
	bottom: 96,
	right: 40,

};


export default App;
