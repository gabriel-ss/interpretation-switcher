import * as React from "react";
import {AppBar, IconButton, Toolbar, TextField, Tooltip, InputAdornment} from "@material-ui/core";
import {PlayArrow, Pause} from "@material-ui/icons";


interface Props {

	isPlaying: boolean;
	isLocked: boolean;
	windowSize: number;
	windowOverlap: number;
	gamma: number;
	epsilon: number;
	toggleReproduction: Function;
	setWindowSize: Function;
	setWindowOverlap: Function;
	setGamma: Function;
	setEpsilon: Function;

}

class PlayerController extends React.Component<Props> {

	public render(): JSX.Element {

		return (
			<AppBar style={controllerStyle} color="default">
				<Toolbar>
					<IconButton
						style={{margin: "0 24px 0 0"}}
						onClick={() => this.props.toggleReproduction()}
					>
						{this.props.isPlaying ? <Pause/> : <PlayArrow/>}
					</IconButton>
					<div style={inputPanelStyle}>
						<Tooltip
							enterDelay={1000}
							title="The window size in samples"
						>
							<TextField
								type="number"
								label={"Window Size"}
								style={inputStyle}
								InputProps={{
									inputProps: {step: 50},
									endAdornment:
										<InputAdornment position="end">ms</InputAdornment>,
								}}
								disabled={this.props.isLocked}
								value={this.props.windowSize}
								onChange={event => this.props.setWindowSize(
									Number(event.target.value) ||
										this.props.windowSize
								)}
							/>
						</Tooltip>
						<Tooltip
							enterDelay={1000}
							title="The overlap between two adjacent windows in samples"
						>
							<TextField
								type="number"
								label={"Window Overlap"}
								style={inputStyle}
								InputProps={{
									inputProps: {min: 0, max: 100},
									endAdornment:
										<InputAdornment position="end">%</InputAdornment>,
								}}
								disabled={this.props.isLocked}
								value={this.props.windowOverlap}
								onChange={event => this.props.setWindowOverlap(
									Number(event.target.value) ||
										this.props.windowOverlap
								)}
							/>
						</Tooltip>
						<Tooltip
							enterDelay={1000}
							title="The compression factor used in the chroma features extraction"
						>
							<TextField
								type="number"
								label={"Compression Factor"}
								style={inputStyle}
								disabled={this.props.isLocked}
								value={this.props.gamma}
								inputProps={{step: 0.1}}
								onChange={event => this.props.setGamma(
									Number(event.target.value) ||
										this.props.gamma
								)}
							/>
						</Tooltip>
						<Tooltip
							enterDelay={1000}
							title="The threshold that defines the minimum length of a vector to be considered relevant to the melody. Vectors shorter than this threshold are replaced by a stub vector."
						>
							<TextField
								type="number"
								label={"Discard Threshold"}
								style={inputStyle}
								disabled={this.props.isLocked}
								value={this.props.epsilon}
								inputProps={{step: 0.1}}
								onChange={event => this.props.setEpsilon(
									Number(event.target.value) ||
										this.props.epsilon
								)}
							/>
						</Tooltip>

					</div>
				</Toolbar>
			</AppBar>
		);

	}

}


const controllerStyle = {

	position: "static" as any,

};

const inputPanelStyle = {

	display: "flex",
	flexFlow: "wrap",
	justifyContent: "center",
	width: "100%",

};

const inputStyle = {
	width: "6em",
	margin: "0 3em",
};

export default PlayerController;
