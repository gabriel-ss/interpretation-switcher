#pragma once
#include "stddef.h"

#ifdef __cplusplus
extern "C" {
#endif


/**
 * Compute the set of indices `path1, path2` that align the two given signals.
 *
 * The alignment is computed with the dtw algorithm over a set of chroma
 * features extracted from the signals' stft, therefore the returned vectors
 * give the alignment of the windows of the transform and not of the signals'
 * samples themselves.
 *
 * @param  signal1         The first signal to be aligned
 * @param  length1         The number of elements in the first signal
 * @param  signal2         The second signal to be aligned
 * @param  length2         The number of elements in the second signal
 * @param  fs              The sampling rate of the signals.
 * @param  wsize           The number of samples of the window to be used in the
 * STFT.
 * @param  overlap         The number of samples shared by two windows in the
 * STFT.
 * @param  gamma           The compression factor to be used in the chroma
 * features extraction.
 * @param  epsilon         The smallest norm that a chroma vector needs to have to
 * not be replaced by a stub one.
 * @param  alignmentLength Pointer to the variable that will hold the returned
 * array's size
 * @return                 An array containing the two alignment paths in
 * sequence. Both paths have the same length, therefore the first one will be
 * in the first half of the array and the second in the second half.
 */
size_t* soundAlign(
	double* signal1,
	size_t length1,
	double* signal2,
	size_t length2,
	double fs,
	size_t wsize,
	size_t overlap,
	double gamma,
	double epsilon,
	size_t* const alignmentLength
);


/**
 * Frees the memory allocated by the soundAlign function
 *
 * @param ptr Pointer returned by the soundAlign function
 */
void freeSndAligment(void* ptr);


#ifdef __cplusplus
}
#endif
