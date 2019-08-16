import * as fs from "fs";
import {promisify} from "util";
import * as decodeBuffer from "audio-decode";


const decode = (() => {

	// Decode with WebAudio API
	if (typeof AudioContext !== "undefined") {

		const context = new AudioContext();

		return async(path: string): Promise<AudioBuffer> => {

			const response = await fetch(path);
			const buffer = await response.arrayBuffer();
			const audio = await context.decodeAudioData(buffer);

			return audio;

		};

	}

	// Decode with node modules
	const readFile: (path: string) => Promise<Buffer> = promisify(fs.readFile);

	return async(path: string): Promise<AudioBuffer> => {

		const fileContent = await readFile(path);
		const decodedAudio: AudioBuffer = await decodeBuffer(fileContent);

		return decodedAudio;

	};


})();


export default decode;
