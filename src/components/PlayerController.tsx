import * as React from "react";
import {AppBar, IconButton, Toolbar} from "@material-ui/core";
import {PlayArrow, Pause} from "@material-ui/icons";


interface Props {

	isPlaying: boolean;
	toggleReproduction: Function;

}

class PlayerController extends React.Component<Props> {

	public render(): JSX.Element {

		return (
			<AppBar style={style} color="default">
				<Toolbar>
					<IconButton onClick={() => this.props.toggleReproduction()}>
						{this.props.isPlaying ? <Pause/> : <PlayArrow/>}
					</IconButton>
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
