import {soundAlign as sndAlign} from "../../build/Release/soundAlign.node";
import decode from "./decoder";


interface AlignmentData {

	windowAlignment: Uint32Array[];
	sampleRate: number;
	samplesPerWindow: number;
	overlappingSamples: number;

}

const soundAlign = (() => {

	let cachedPath = "";
	let cachedSignal = new ArrayBuffer(0);
	let cachedSignalSampleRate = 0;

	const soundAlign =
		async(
			path1: string,
			path2: string,
			windowSize: number,
			windowOverlap: number,
			gamma: number,
			epsilon: number
		): Promise<AlignmentData> => {

			if (cachedPath !== path1) {

				const cachedAudio = await decode(path1);

				cachedPath = path1;
				cachedSignal = cachedAudio.getChannelData(0).buffer;
				cachedSignalSampleRate = cachedAudio.sampleRate;

			}

			const samplesPerWindow =
				Math.floor(windowSize * cachedSignalSampleRate / 1000);
			const overlappingSamples =
				Math.floor(samplesPerWindow * windowOverlap / 100);

			const audio = await decode(path2);

			if (cachedSignalSampleRate !== audio.sampleRate)
				throw new Error("The sample rate of the tracks does not match");


			const result = sndAlign(
				cachedSignal,
				audio.getChannelData(0).buffer,
				cachedSignalSampleRate,
				samplesPerWindow,
				overlappingSamples,
				gamma,
				epsilon
			);

			const secondTrackPosition = result.byteLength / 2;
			const samplesInTrack =
				secondTrackPosition / Uint32Array.BYTES_PER_ELEMENT;

			const track1 = new Uint32Array(result, 0, samplesInTrack);
			const track2 = new Uint32Array(result, secondTrackPosition);

			return {
				windowAlignment: [track1, track2],
				sampleRate: cachedSignalSampleRate,
				samplesPerWindow,
				overlappingSamples,
			};

		};

	return soundAlign;

})();

export default soundAlign;
