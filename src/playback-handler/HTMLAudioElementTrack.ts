import Track from "./Track";


/**
 * Track implementation using the native HTML Audio Element
 */
class HTMLAudioElementTrack implements Track {

	public name: string;

	public alignment?: Uint32Array[];

	private audioElement: HTMLAudioElement;

	public get currentPosition(): number {

		return this.audioElement ? this.audioElement.currentTime : 0;

	}

	public set currentPosition(currrentPosition: number) {

		this.audioElement.currentTime = currrentPosition;

	}

	public get duration(): number {

		return this.audioElement ? this.audioElement.duration : 0;

	}

	public constructor(path: string) {

		const URI = path.split("/").map(part => encodeURIComponent(part)).join("/");

		this.audioElement = new Audio(URI);
		[, this.name] = path.match(/.*\/(.*)/) as string[];
		this.currentPosition = 0;

	}

	public play(): void {

		this.audioElement.play();


	}

	public pause(): void {

		this.audioElement.pause();

	}

}

export default HTMLAudioElementTrack;
