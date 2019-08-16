/**
 * Representation of a single track. Must handle the audio playback.
 * @interface Track
 */
interface Track {

	/**
	 * The name of the track to be displayed.
	 * @method play
	 */
	name: string;

	/**
	 * The current position of the track in seconds.
	 */
	currentPosition: number;

	/**
	 * The alignment of the track with the master track.
	 */
	alignment?: Uint32Array[];

	/**
	 * The duration of the track in seconds.
	 */
	readonly duration: number;

	/**
	 * Start the playback in currentTime position of the track.
	 * @method play
	 */
	play(): void;

	/**
	 * Pauses the playback of the track.
	 * @method pause
	 */
	pause(): void;

}

export default Track;
