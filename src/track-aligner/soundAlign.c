#include <node_api.h>
#include "../../lib/libsndalign.h"

#ifdef DEBUG
#include <stdio.h>
#define DEBUG_PRINT(...) printf(__VA_ARGS__)
#else
#define DEBUG_PRINT(...) do {} while(0)
#endif

void memFree(napi_env env, void* finalize_data, void* finalize_hint) {

	freeSndAligment(finalize_data);
	DEBUG_PRINT("Memory released\n");

}


napi_value sndAlign(napi_env env, napi_callback_info info) {
	napi_value argv[7];
	size_t argc = 7;

	napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
	DEBUG_PRINT("argc: %zu\n", argc);

	if (argc < 7) {
		napi_throw_error(env, "EINVAL", "Too few arguments");
		return NULL;
	}


	napi_status statusBuffer1, statusBuffer2, statusSR, statusWS, statusWO, statusGamma, statusEpsilon, statusResult;


	size_t length1, length2;
	void *signal1, *signal2;

	statusBuffer1 = napi_get_arraybuffer_info(env, argv[0], &signal1, &length1);
	statusBuffer2 = napi_get_arraybuffer_info(env, argv[1], &signal2, &length2);

	if (statusBuffer1 || statusBuffer2) {
		napi_throw_error(env, NULL, "Error processing buffers");
		return NULL;
	}


	unsigned windowSize, windowOverlap;

	statusWS = napi_get_value_uint32(env, argv[3], &windowSize);
	statusWO = napi_get_value_uint32(env, argv[4], &windowOverlap);

	if (statusWS || statusWO) {
		napi_throw_type_error(env, NULL,
			"Parameters 4 (Window Size) and 5 (Window Overlap) must be integer numbers");
		return NULL;
	}


	double samplingRate, gamma, epsilon;

	statusSR = napi_get_value_double(env, argv[2], &samplingRate);
	statusGamma = napi_get_value_double(env, argv[5], &gamma);
	statusEpsilon = napi_get_value_double(env, argv[6], &epsilon);

	if (statusSR || statusGamma || statusEpsilon) {
		napi_throw_type_error(env, NULL,
			"Parameters 3 (Sampling Rate), 6 (Gamma) and 7 (Epsilon) must be numbers");
		return NULL;
	}

	DEBUG_PRINT("Buffer 1 length: %zu; Buffer 2 length: %zu\n", length1, length2);
	DEBUG_PRINT("Sampling Rate:%f\n", samplingRate);
	DEBUG_PRINT("Window Sizes:%u; Window Overlap:%u\n", windowSize, windowOverlap);
	DEBUG_PRINT("Gamma:%f Epsilon:%f\n", gamma, epsilon);


	index_t* alignment, alignmentLength;
	alignment = soundAlign(
		signal1, length1 / sizeof(pcm_t),
		signal2, length2 / sizeof(pcm_t),
		(pcm_t)samplingRate, (index_t)windowSize, (index_t)windowOverlap,
		(pcm_t)gamma, (pcm_t)epsilon, &alignmentLength
	);

	DEBUG_PRINT("alignmentLength: %u\n", alignmentLength);


	napi_value result;
	statusResult = napi_create_external_arraybuffer(env, alignment, sizeof(index_t) * alignmentLength, memFree, NULL, &result);

	if (statusResult) {
		napi_throw_error(env, NULL, "Error processing return buffer");
		return NULL;
	}

	return result;

}


napi_value init(napi_env env, napi_value exports) {

	napi_value soundAlign;
	napi_create_function(env, "soundAlign", 10, sndAlign, NULL, &soundAlign);
	napi_set_named_property(env, exports, "soundAlign", soundAlign);

	return exports;

}


NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
