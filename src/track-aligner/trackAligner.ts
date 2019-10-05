import {soundAlign as sndAlign} from "../../build/Release/soundAlign.node";


interface AlignmentData {

	windowAlignment: Uint32Array[];
	samplesPerWindow: number;
	overlappingSamples: number;

}


/**
 * Evaluates the alignment between two audioBuffers. Wrapper around the native
 * track aligner implementation.
 *
 * @method soundAlign
 * @param  track1        The first track to be aligned.
 * @param  track2        The second track to be aligned.
 * @param  windowSize    The window size in miliseconds to be used in the STFT.
 * @param  windowOverlap The percentual overlap between two adjacent windows.
 * @param  gamma         The compression factor to be used in the chroma
 * features extraction.
 * @param  epsilon       The smallest norm that a chroma vector needs to have to
 * not be replaced by a stub one.
 * @return               An object containing the evaluated alignment parameters
 * and the aligment paths.
 */
function soundAlign(
	track1: AudioBuffer,
	track2: AudioBuffer,
	windowSize: number,
	windowOverlap: number,
	gamma: number,
	epsilon: number
): AlignmentData {

	if (track1.sampleRate !== track2.sampleRate)
		throw new Error("The sample rate of the tracks does not match");


	const samplesPerWindow =
		Math.floor(windowSize * track1.sampleRate / 1000);
	const overlappingSamples =
		Math.floor(samplesPerWindow * windowOverlap / 100);


	const result = sndAlign(
		track1.getChannelData(0).buffer,
		track2.getChannelData(0).buffer,
		track1.sampleRate,
		samplesPerWindow,
		overlappingSamples,
		gamma,
		epsilon
	);

	const secondTrackPosition = result.byteLength / 2;
	const samplesInTrack =
		secondTrackPosition / Uint32Array.BYTES_PER_ELEMENT;

	const alignmentPath1 = new Uint32Array(result, 0, samplesInTrack);
	const alignmentPath2 = new Uint32Array(result, secondTrackPosition);

	return {
		windowAlignment: [alignmentPath1, alignmentPath2],
		samplesPerWindow,
		overlappingSamples,
	};

}

export default soundAlign;
