import {Howl} from "howler";
import Track from "./Track";


/**
 * Track implementation using the Howler.js lib
 */
class HowlerTrack implements Track {

	public name: string;

	public alignment?: Uint32Array[];

	private howl: Howl;

	public get currentPosition(): number {

		return this.howl ? this.howl.seek() as number : 0;

	}

	public set currentPosition(currrentPosition: number) {

		this.howl.seek(currrentPosition);

	}

	public get duration(): number {

		return this.howl ? this.howl.duration() : 0;

	}

	public constructor(path: string) {

		const URI = path.split("/").map(part => encodeURIComponent(part)).join("/");

		this.howl = new Howl({

			src: [URI],
			autoplay: false,
			loop: false,

		});

		[, this.name] = path.match(/.*\/(.*)/) as string[];
		this.currentPosition = 0;

	}

	public play(): void {

		this.howl && this.howl.play();


	}

	public pause(): void {

		this.howl && this.howl.pause();

	}

}

export default HowlerTrack;
