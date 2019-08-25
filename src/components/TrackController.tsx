import * as React from "react";
import Track from "../playback-handler/Track";
import {IconButton, Paper, Radio, Toolbar, Typography, Slider} from "@material-ui/core";
import {Close} from "@material-ui/icons";


interface Props {

	track: Track;
	setPosition: Function;
	selectTrack: Function;
	removeTrack: Function;
	isSelected: boolean;

}

class TrackController extends	React.Component<Props> {

	public render(): JSX.Element {

		const {currentPosition, duration, name} = this.props.track;

		return (
			<Paper style={trackStyle}>
				<Toolbar>
					<Radio
						checked={this.props.isSelected}
						color={"primary"}
						onChange={() =>
							this.props.selectTrack()}
					/>
					<div style={sliderStyle}>
						<Typography
							variant="button"
							align="left"
						>
							{name}
						</Typography>
						<Slider
							value={(100 * currentPosition / duration) || 0}
							aria-labelledby="label"
							onChange={(_event, position) =>
								this.props.setPosition(
									position as number * duration / 100
								)}
						/>
					</div>
					<IconButton onClick={() => this.props.removeTrack()}>
						<Close/>
					</IconButton>
				</Toolbar>
			</Paper>
		);

	}

}


const trackStyle = {

	padding: ".75rem 0",
	margin: "1rem",

};

const sliderStyle = {

	display: "inline-flex" as any,
	flex: "auto",
	flexDirection: "column" as any,
	justifyContent: "space-between" as any,
	height: "2.5rem",
	padding: "12px 24px",

};

export default TrackController;
