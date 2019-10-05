import Track from "./playback-handler/Track";
import TrackImplementation from "./playback-handler/HowlerTrack";
import {PlayerController, TrackControllerList} from "./components";
import * as React from "react";
import {Modal, Typography, Fab, Snackbar, SnackbarContent, IconButton, MuiThemeProvider, createMuiTheme} from "@material-ui/core";
import {cyan} from "@material-ui/core/colors";
import {Add, Close} from "@material-ui/icons";
import {ipcRenderer} from "electron";


interface State {

	trackList: Track[];
	selectedTrack: number;
	isPlaying: boolean;
	isLoadingTrack: boolean;
	windowSize: number;
	samplesPerWindow: number;
	windowOverlap: number;
	overlappingSamples: number;
	sampleRate: number;
	gamma: number;
	epsilon: number;
	notification: string;
	displayNotification: boolean;

}

export class App extends React.Component<{}, State> {

	public state = {
		trackList: [] as Track[],
		selectedTrack: 0,
		isPlaying: false,
		isLoadingTrack: false,
		windowSize: 200,
		samplesPerWindow: 0,
		windowOverlap: 50,
		overlappingSamples: 0,
		sampleRate: 0,
		gamma: 0.1,
		epsilon: 0.1,
		notification: "",
		displayNotification: false,
	}


	public constructor(props: {}) {

		super(props);

		ipcRenderer.on("fileSelect", (_event, path) => {

			const track = new TrackImplementation(path);
			const state: any = {trackList: [...this.state.trackList, track]};

			this.setState(state);

		});

		ipcRenderer.on("selectionCancelation", () => {

			this.setState({isLoadingTrack: false});

		});

		ipcRenderer.on("masterAddition", (_event, sampleRate) => {

			this.setState({sampleRate,	isLoadingTrack: false});

			this.syncTracks();

		});

		ipcRenderer.on("trackAlignment", (_event, alignmentData) => {

			const {
				windowAlignment, samplesPerWindow, overlappingSamples,
			} = alignmentData;

			this.state.trackList[this.state.trackList.length - 1].alignment =
				windowAlignment.map((segment: Uint8Array) =>
					new Uint32Array(segment.buffer));

			this.setState({
				samplesPerWindow,
				overlappingSamples,
				isLoadingTrack: false,
			});

			this.syncTracks();

		});

		ipcRenderer.on("alignmentFailure", (_event, error) => {

			this.setState({
				trackList: this.state.trackList.filter((_item, trackIndex) =>
					trackIndex !== this.state.trackList.length - 1),
				notification: error,
				displayNotification: true,
				isLoadingTrack: false,
			});

			setTimeout(() => this.setState({displayNotification: false}), 5000);

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

		const {windowSize, windowOverlap, gamma, epsilon} = this.state;

		this.setState({isLoadingTrack: true});

		ipcRenderer.send("trackAddition", windowSize, windowOverlap, gamma, epsilon);

	}

	private removeTrack = (track: number) => (): void => {

		const {isPlaying, selectedTrack, trackList} = this.state;

		if (isPlaying && track === selectedTrack) {

			this.toggleReproduction();
			this.setState({selectedTrack: 0});

		}

		if (trackList.length)
			ipcRenderer.send("masterTrackReset");

		this.setState({trackList: trackList.filter(
			(_item, trackNumber) => track !== trackNumber
		)});

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


	private syncTracks(trackNumber?: number): void {

		const {
			sampleRate,
			samplesPerWindow,
			overlappingSamples,
			selectedTrack,
			trackList,
		} = this.state;

		const referenceTrack = trackNumber || trackNumber === 0
			? trackNumber : selectedTrack;

		const currentTrack = trackList[referenceTrack];

		if (!currentTrack) return;

		const {currentPosition, alignment} = currentTrack;
		// Evaluate the window where the current sample is
		const currentWindow = Math.floor(
			currentPosition * sampleRate / (samplesPerWindow - overlappingSamples)
		);

		let referenceWindow: number;

		// Find the corresponding window on the master track
		if (alignment) {

			const referenceIndex = alignment[1].indexOf(currentWindow);

			referenceWindow = alignment[0][referenceIndex];

		} else
			referenceWindow = currentWindow;


		trackList.filter(track => track !== currentTrack)
			.forEach(track => {

				let alignedWindow: number;

				// Align the track with the master track
				if (track.alignment) {

					const alignedIndex = track.alignment[0].indexOf(referenceWindow);

					alignedWindow = track.alignment[1][alignedIndex];

				} else
					alignedWindow = referenceWindow;

				track.currentPosition = alignedWindow *
					(samplesPerWindow - overlappingSamples) / sampleRate;

			});

	}

	public setWindowSize = (windowSize: number): void =>
		this.setState({windowSize})

	public setWindowOverlap = (windowOverlap: number): void =>
		this.setState({windowOverlap})

	public setGamma = (gamma: number): void =>
		this.setState({gamma})

	public setEpsilon = (epsilon: number): void =>
		this.setState({epsilon})


	public render(): JSX.Element {

		return (
			<MuiThemeProvider theme={theme}>
				<div style={appStyle} className="App">
					<Snackbar
						anchorOrigin={{vertical: "top", horizontal: "right"}}
						open={this.state.displayNotification}
					>
						<SnackbarContent
							action={
								<IconButton
									key={"close"}
									color={"primary"}
									onClick={() =>
										this.setState({displayNotification: false})}
								>
									<Close/>
								</IconButton>}
							message={this.state.notification}
						/>
					</Snackbar>
					<div style={trackListStyle}>
						<TrackControllerList
							trackList={this.state.trackList}
							selectedTrack={this.state.selectedTrack}
							isPlaying={this.state.isPlaying}
							setTrackPosition={this.setTrackPosition}
							setSelectedTrack={this.setSelectedTrack}
							removeTrack={this.removeTrack}
						/>
					</div>
					<div style={playerBarStyle}>
						<Fab
							style={buttonStyle}
							onClick={this.addTrack}
						>
							<Add/>
						</Fab>
						<PlayerController
							isPlaying={this.state.isPlaying}
							isLocked={Boolean(this.state.trackList.length)}
							toggleReproduction={this.toggleReproduction}
							windowSize={this.state.windowSize}
							windowOverlap={this.state.windowOverlap}
							gamma={this.state.gamma}
							epsilon={this.state.epsilon}
							setWindowSize={this.setWindowSize}
							setWindowOverlap={this.setWindowOverlap}
							setGamma={this.setGamma}
							setEpsilon={this.setEpsilon}
						/>
						<Modal open={this.state.isLoadingTrack}>
							<Typography
								align={"center"}
								color={"primary"}
								style={modalStyle}
								variant={"h2"}
							>Loading Track</Typography>
						</Modal>
					</div>
				</div>
			</MuiThemeProvider>
		);

	}

}


const theme = createMuiTheme({
	palette: {
		type: "dark",
		primary: cyan,
	},
});

const appStyle = {

	backgroundColor: "#2d2d2d",
	minHeight: "100vh",
	color: "#FFFFFF",

};

const modalStyle = {

	position: "absolute" as any,
	outline: "none",
	width: "100%",
	top: "50%",

};

const trackListStyle = {

	position: "absolute" as any,
	top: 0,
	height: "calc(100vh - 120px)",
	width: "100%",
	overflowX: "hidden" as any,
	overflowY: "auto" as any,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: "calc(10px + 2vmin)",
	background: "url(./assets/background.svg) no-repeat center",

};

const playerBarStyle = {

	position: "absolute" as any,
	textAlign: "end" as any,
	bottom: 0,
	width: "100%",

};

const buttonStyle = {

	position: "relative" as any,
	bottom: 40,
	right: 40,

};


export default App;
