import {soundAlign as sndAlign} from "../../build/Release/soundAlign.node";
import decode from "./decoder";


const soundAlign = (() => {

	let cachedPath = "";
	let cachedSignal = new ArrayBuffer(0);

	const soundAlign =
		async(
			path1: string,
			path2: string,
			windowSize: number,
			windowOverlap: number,
			gamma: number,
			epsilon: number
		): Promise<Uint32Array[]> => {

			if (cachedPath !== path1) {

				cachedPath = path1;
				cachedSignal = (await decode(path1)).getChannelData(0).buffer;

			}

			const signal = (await decode(path2)).getChannelData(0).buffer;
			const result = sndAlign(
				cachedSignal, signal, 44100, windowSize, windowOverlap, gamma, epsilon
			);

			const secondTrackPosition = result.byteLength / 2;
			const samplesInTrack =
				secondTrackPosition / Uint32Array.BYTES_PER_ELEMENT;

			const track1 = new Uint32Array(result, 0, samplesInTrack);
			const track2 = new Uint32Array(result, secondTrackPosition);

			return [track1, track2];

		};

	return soundAlign;

})();

export default soundAlign;
