import * as React from "react";
import {AppBar, IconButton, Toolbar, TextField} from "@material-ui/core";
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
			<AppBar style={style} color="default">
				<Toolbar>
					<IconButton
						style={{margin: "0 24px 0 0"}}
						onClick={() => this.props.toggleReproduction()}
					>
						{this.props.isPlaying ? <Pause/> : <PlayArrow/>}
					</IconButton>
					<div style={{margin: "auto"}}>
						<TextField
							type="number"
							label={"Window Size"}
							disabled={this.props.isLocked}
							value={this.props.windowSize}
							onChange={event => this.props.setWindowSize(
								Number(event.target.value) || this.props.windowSize
							)}
						/>
						<TextField
							type="number"
							label={"Window Overlap"}
							disabled={this.props.isLocked}
							value={this.props.windowOverlap}
							onChange={event => this.props.setWindowOverlap(
								Number(event.target.value) || this.props.windowOverlap
							)}
						/>
						<TextField
							type="number"
							label={"Gamma"}
							disabled={this.props.isLocked}
							value={this.props.gamma}
							inputProps={{step: 0.1}}
							onChange={event => this.props.setGamma(
								Number(event.target.value) || this.props.gamma
							)}
						/>
						<TextField
							type="number"
							label={"Epsilon"}
							disabled={this.props.isLocked}
							value={this.props.epsilon}
							inputProps={{step: 0.1}}
							onChange={event => this.props.setEpsilon(
								Number(event.target.value) || this.props.epsilon
							)}
						/>
					</div>
				</Toolbar>
			</AppBar>
		);

	}

}


const style = {

	top: "auto",
	bottom: "0px",

};

export default PlayerController;
